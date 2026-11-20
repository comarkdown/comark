import type { ElementNode, Node } from './types.ts'

/**
 * Render-time streaming effects (caret, fade-in, custom).
 *
 * Effects decorate the parsed tree just before a renderer turns it into UI. They never mutate the
 * input nodes or the parsed document: every change copies only the path it touches, so reused
 * blocks keep their identity. Each renderer instance owns one {@link StreamRenderer}, which keeps
 * per-effect state (keyed by effect `name`) between renders.
 */

/** Context passed to {@link StreamEffect.apply}. */
export interface StreamEffectContext<TState = any> {
  /** Whether the document is still streaming. */
  streaming: boolean
  /** Monotonic timestamp in milliseconds for this render. */
  now: number
  /** State owned by this effect, created by {@link StreamEffect.init} and kept between renders. */
  state: TState
}

/** A render-time transform of the top-level nodes. */
export interface StreamEffect<TState = any> {
  /** Unique name. State is keyed by it, so recreating an effect object keeps its state. */
  name: string
  /** Create the initial state on first use. */
  init?: () => TState
  /** Return decorated nodes. Must not mutate `nodes` or any node inside it. */
  apply: (nodes: Node[], context: StreamEffectContext<TState>) => Node[]
}

export interface StreamRenderOptions {
  /** Whether the document is still streaming. */
  streaming?: boolean
  /** Effects to run, in order. */
  effects?: readonly StreamEffect[]
}

export interface StreamRenderer {
  /** Run `effects` over `nodes`. Returns `nodes` itself when there is nothing to run. */
  render: (nodes: readonly Node[], options?: StreamRenderOptions) => Node[]
  /** Drop all effect state, e.g. when the renderer shows a different document. */
  reset: () => void
}

export interface StreamRendererOptions {
  /** Clock used for effect timing. Defaults to `performance.now()`. */
  now?: () => number
}

/** Props every renderer accepts for streaming effects. */
export interface StreamEffectProps {
  streaming?: boolean
  caret?: boolean | CaretOptions
  fade?: boolean | FadeOptions
  effects?: readonly StreamEffect[]
}

const defaultNow = (): number => (typeof performance !== 'undefined' ? performance.now() : Date.now())

/**
 * Create the per-instance effect runner a renderer keeps between renders.
 *
 * @example
 * ```ts
 * const stream = createStreamRenderer()
 * const nodes = stream.render(document.nodes, { streaming: true, effects: [fade(), caret()] })
 * ```
 */
export function createStreamRenderer(options: StreamRendererOptions = {}): StreamRenderer {
  const now = options.now ?? defaultNow
  const states = new Map<string, unknown>()

  return {
    render(nodes, { streaming = false, effects } = {}) {
      if (!effects || effects.length === 0) return nodes as Node[]
      const time = now()
      let out = nodes as Node[]
      for (const effect of effects) {
        if (!states.has(effect.name)) states.set(effect.name, effect.init?.())
        out = effect.apply(out, { streaming, now: time, state: states.get(effect.name) })
      }
      return out
    },
    reset() {
      states.clear()
    },
  }
}

/**
 * Build the effect list from renderer props: `fade`, then custom `effects`, then `caret` so the
 * caret lands after any decorated text.
 */
export function resolveStreamEffects(props: StreamEffectProps): StreamEffect[] {
  const effects: StreamEffect[] = []
  if (props.fade) effects.push(fade(props.fade === true ? {} : props.fade))
  if (props.effects) effects.push(...props.effects)
  if (props.caret) effects.push(caret(props.caret === true ? {} : props.caret))
  return effects
}

/** Render-time key for a node, set by stream effects in `$.key`. */
export function getStreamKey(node: Node): string | undefined {
  if (!Array.isArray(node)) return undefined
  const key = (node[1] as ElementNode[1] | undefined)?.$?.key
  return typeof key === 'string' ? key : undefined
}

/**
 * Stable keys for rendering `children`. Nodes an effect inserted use their `$.key`; other elements
 * and text are numbered separately, so splitting a text node into text and spans never shifts the
 * key of a sibling element (which would re-mount it).
 */
export function getChildKeys(children: readonly Node[]): string[] {
  const keys: string[] = new Array(children.length)
  let elements = 0
  let texts = 0
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const key = getStreamKey(child)
    keys[i] = key ?? (typeof child === 'string' ? `t${texts++}` : String(elements++))
  }
  return keys
}

const MAX_DEPTH = 50

const injectedStyles = new Set<string>()

/**
 * Add a stylesheet to the document once per `id`. A no-op without a DOM (SSR): the markup still
 * carries the classes, and the client injects the sheet on its first render.
 */
export function injectStreamStyles(id: string, css: string): void {
  if (injectedStyles.has(id) || typeof document === 'undefined') return
  injectedStyles.add(id)
  try {
    // Constructable sheets are not blocked by a `style-src` CSP that forbids inline `<style>`.
    if (Array.isArray(document.adoptedStyleSheets) && typeof CSSStyleSheet === 'function') {
      const sheet = new CSSStyleSheet()
      sheet.replaceSync(css)
      document.adoptedStyleSheets = [...document.adoptedStyleSheets, sheet]
      return
    }
    const style = document.createElement('style')
    style.setAttribute('data-comark', id)
    style.textContent = css
    document.head.appendChild(style)
  } catch {
    injectedStyles.delete(id)
  }
}

// #region caret

export interface CaretOptions {
  /** Class added to the caret element. */
  class?: string
}

const CARET_KEY = 'comark-caret'
const CARET_TEXT = '\u2009' // Thin space avoids a wide gap between text and caret
/** Inline style of the default caret. */
export const CARET_STYLE =
  'background-color: currentColor; display: inline-block; margin-left: 0.25rem; margin-right: 0.25rem; animation: comark-pulse 0.75s cubic-bezier(0.4,0,0.6,1) infinite;'
/** Keyframes the default caret animates with. */
export const CARET_STYLES = '@keyframes comark-pulse{50%{opacity:.5}}'

/** Create a caret node. */
export function createCaretNode(options: CaretOptions = {}): ElementNode {
  return [
    'span',
    { $: { key: CARET_KEY }, ...(options.class ? { class: options.class } : {}), style: CARET_STYLE },
    CARET_TEXT,
  ]
}

/**
 * Append a caret after the last text of the document while streaming.
 */
export function caret(options: CaretOptions = {}): StreamEffect<undefined> {
  return {
    name: 'caret',
    apply(nodes, { streaming }) {
      if (!streaming || nodes.length === 0) return nodes
      injectStreamStyles('caret', CARET_STYLES)
      return appendCaret(nodes, createCaretNode(options))
    },
  }
}

/**
 * Append `caretNode` to the parent of the last text node in the last top-level node (copying only
 * that path), or to the top level when the last node has no text.
 */
export function appendCaret(nodes: Node[], caretNode: ElementNode): Node[] {
  const last = nodes.length - 1
  const lastNode = nodes[last]
  if (Array.isArray(lastNode) && lastNode[0] !== null) {
    const updated = appendToLastText(lastNode as ElementNode, caretNode, 0)
    if (updated) {
      const copy = nodes.slice()
      copy[last] = updated
      return copy
    }
  }
  return [...nodes, caretNode]
}

function appendToLastText(parent: ElementNode, caretNode: ElementNode, depth: number): ElementNode | null {
  if (depth >= MAX_DEPTH || getStreamKey(parent) === CARET_KEY) return null
  for (let i = parent.length - 1; i >= 2; i--) {
    const child = parent[i] as Node
    if (typeof child === 'string' || isFadeSpan(child)) {
      return [...parent, caretNode] as ElementNode
    }
    if (Array.isArray(child) && child[0] !== null) {
      const updated = appendToLastText(child as ElementNode, caretNode, depth + 1)
      if (updated) {
        const copy = parent.slice() as ElementNode
        copy[i] = updated
        return copy
      }
    }
  }
  return null
}

// #endregion

// #region fade

export interface FadeOptions {
  /**
   * Animation duration in milliseconds. A block's spans merge back into plain text this long after
   * its last chunk starts fading.
   * @default 300
   */
  duration?: number
  /** CSS easing. @default 'ease-out' */
  easing?: string
  /**
   * Delay in milliseconds between consecutive words. `0` fades each streamed chunk as a whole.
   * Words queue across chunks, and the queue never lags more than `duration` behind.
   * @default 0
   */
  stagger?: number
  /**
   * Class on fading spans. Setting it turns `styles` off by default so your own CSS drives the
   * animation.
   * @default 'comark-fade'
   */
  class?: string
  /**
   * Add the default keyframes ({@link FADE_STYLES}) to the document the first time something fades.
   * Turn off when shipping them yourself, e.g. inside a shadow root.
   * @default true unless `class` is set
   */
  styles?: boolean
  /** Tags whose subtrees never fade. Replaces {@link DEFAULT_FADE_EXCLUDE}. */
  exclude?: readonly string[]
}

/** Tags that never fade by default: code and rendered output that would re-mount or break if split. */
export const DEFAULT_FADE_EXCLUDE: readonly string[] = ['pre', 'math', 'mermaid', 'svg', 'script', 'style', 'textarea']

const FADE_CLASS = 'comark-fade'
const FADE_KEY_PREFIX = 'comark-fade:'
const DEFAULT_DURATION = 300

/** Default fade stylesheet, for apps that ship it themselves with `styles: false`. */
export const FADE_STYLES = `@keyframes comark-fade-in{from{opacity:0}to{opacity:1}}.${FADE_CLASS}{animation:comark-fade-in ${DEFAULT_DURATION}ms ease-out both}@media (prefers-reduced-motion:reduce){.${FADE_CLASS}{animation:none}}`

interface FadeSegment {
  /** Offset range in the block's fadeable text. */
  start: number
  end: number
  /** When the span appears; its animation starts `delay` ms later. */
  born: number
  delay: number
}

interface FadeBlock {
  text: string
  segments: FadeSegment[]
}

interface FadeState {
  source: readonly Node[] | null
  blocks: FadeBlock[]
  /** Earliest start for the next staggered word. */
  nextAt: number
}

function isFadeSpan(node: Node): boolean {
  return getStreamKey(node)?.startsWith(FADE_KEY_PREFIX) === true
}

/**
 * Fade in text as it streams.
 *
 * Diffs each top-level block's text against what was shown last render: only characters past the
 * common prefix are new, so restructuring (a paragraph turning into a heading, auto-closed markup,
 * linkified URLs) never replays the fade on text already on screen. New characters are wrapped in
 * keyed spans that merge back into plain text once the block's last animation finishes.
 */
export function fade(options: FadeOptions = {}): StreamEffect<FadeState> {
  const duration = options.duration ?? DEFAULT_DURATION
  const stagger = Math.max(0, options.stagger ?? 0)
  const className = options.class ?? FADE_CLASS
  const styles = options.styles ?? options.class === undefined
  const exclude = new Set(options.exclude ?? DEFAULT_FADE_EXCLUDE)

  let inlineStyle = ''
  if (options.duration !== undefined) inlineStyle += `animation-duration:${duration}ms;`
  if (options.easing !== undefined) inlineStyle += `animation-timing-function:${options.easing};`

  const isExcluded = (node: ElementNode) => exclude.has(node[0]) || isFadeSpan(node) || getStreamKey(node) === CARET_KEY

  function fadeableText(node: Node, depth: number): string {
    if (typeof node === 'string') return node
    if (node[0] === null || depth >= MAX_DEPTH || isExcluded(node as ElementNode)) return ''
    let out = ''
    for (let i = 2; i < node.length; i++) out += fadeableText(node[i] as Node, depth + 1)
    return out
  }

  function addSegments(segments: FadeSegment[], text: string, start: number, now: number, state: FadeState): void {
    if (stagger === 0) {
      segments.push({ start, end: text.length, born: now, delay: 0 })
      return
    }
    let i = start
    while (i < text.length) {
      let end = i
      while (end < text.length && !isSpace(text.charCodeAt(end))) end++
      while (end < text.length && isSpace(text.charCodeAt(end))) end++
      const at = Math.max(now, Math.min(state.nextAt, now + duration))
      state.nextAt = at + stagger
      segments.push({ start: i, end, born: now, delay: Math.round(at - now) })
      i = end
    }
  }

  function splitText(text: string, offset: number, segments: FadeSegment[]): Node[] | null {
    const end = offset + text.length
    let pieces: Node[] | null = null
    let cursor = offset
    for (const segment of segments) {
      if (segment.end <= cursor) continue
      if (segment.start >= end) break
      pieces ??= []
      const from = Math.max(segment.start, cursor)
      const to = Math.min(segment.end, end)
      if (from > cursor) pieces.push(text.slice(cursor - offset, from - offset))
      const style = inlineStyle + (segment.delay > 0 ? `animation-delay:${segment.delay}ms;` : '')
      pieces.push([
        'span',
        { $: { key: FADE_KEY_PREFIX + from }, class: className, ...(style ? { style } : {}) },
        text.slice(from - offset, to - offset),
      ])
      cursor = to
    }
    if (pieces && cursor < end) pieces.push(text.slice(cursor - offset))
    return pieces
  }

  /** Returns the decorated children list for `node`, or `null` when unchanged. */
  function decorate(node: ElementNode, segments: FadeSegment[], offset: { value: number }, depth: number) {
    if (depth >= MAX_DEPTH || isExcluded(node)) return null
    let copy: Node[] | null = null
    for (let i = 2; i < node.length; i++) {
      const child = node[i] as Node
      if (typeof child === 'string') {
        const pieces = splitText(child, offset.value, segments)
        offset.value += child.length
        if (pieces) {
          copy ??= node.slice(0, i) as Node[]
          copy.push(...pieces)
          continue
        }
      } else if (child[0] !== null) {
        const updated = decorate(child as ElementNode, segments, offset, depth + 1)
        if (updated) {
          copy ??= node.slice(0, i) as Node[]
          copy.push(updated as ElementNode)
          continue
        }
      }
      copy?.push(child)
    }
    return copy as ElementNode | null
  }

  return {
    name: 'fade',
    init: () => ({ source: null, blocks: [], nextAt: 0 }),
    apply(nodes, { streaming, now, state }) {
      const previous = state.source
      state.source = nodes
      const blocks = state.blocks
      let out: Node[] | null = null
      let active = false

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        const block = blocks[i]
        if (block && block.segments.length === 0 && previous?.[i] === node) {
          out?.push(node)
          continue
        }

        const text = fadeableText(node, 0)
        const common = block ? commonPrefixLength(block.text, text) : streaming ? 0 : text.length
        // A block's spans merge back into text all at once, when its last one finishes. Spans are
        // then only ever appended, so positional keys never move an animating span to a new element.
        const segments: FadeSegment[] = []
        const previousSegments = block?.segments ?? []
        if (previousSegments.some((segment) => now < segment.born + segment.delay + duration)) {
          for (const segment of previousSegments) {
            const end = Math.min(segment.end, common)
            if (segment.start < end) segments.push(end === segment.end ? segment : { ...segment, end })
          }
        }
        if (streaming && text.length > common) addSegments(segments, text, common, now, state)
        blocks[i] = { text, segments }
        if (segments.length === 0) {
          out?.push(node)
          continue
        }

        active = true
        out ??= nodes.slice(0, i)
        if (typeof node === 'string') {
          out.push(...(splitText(node, 0, segments) ?? [node]))
        } else {
          out.push(
            (node[0] !== null && decorate(node as ElementNode, segments, { value: 0 }, 0)) || (node as ElementNode)
          )
        }
      }
      blocks.length = nodes.length

      if (active && styles) injectStreamStyles('fade', FADE_STYLES)
      return out ?? nodes
    },
  }
}

function commonPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length)
  let i = 0
  while (i < max && a.charCodeAt(i) === b.charCodeAt(i)) i++
  return i
}

function isSpace(code: number): boolean {
  return code === 32 || code === 9 || code === 10 || code === 13
}

// #endregion

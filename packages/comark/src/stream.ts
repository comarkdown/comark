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
  /** Whether work is still queued and the renderer must render again without new input. */
  pending?: (state: TState) => boolean
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
  /** Whether the last `render` left work queued, so the renderer should schedule another frame. */
  pending: () => boolean
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
  let pending = false

  return {
    render(nodes, { streaming = false, effects } = {}) {
      pending = false
      if (!effects || effects.length === 0) return nodes as Node[]
      const time = now()
      let out = nodes as Node[]
      // An earlier effect with queued work (e.g. `pace` draining after the stream ended) releases text
      // that later effects must still treat as streaming, or `fade` would skip the new text.
      let streamingNow = streaming
      for (const effect of effects) {
        if (!states.has(effect.name)) states.set(effect.name, effect.init?.())
        const state = states.get(effect.name)
        out = effect.apply(out, { streaming: streamingNow, now: time, state })
        if (effect.pending?.(state)) {
          pending = true
          streamingNow = true
        }
      }
      return out
    },
    pending: () => pending,
    reset() {
      states.clear()
      pending = false
    },
  }
}

/**
 * Build the effect list from renderer props: custom `effects` (such as `pace`), then `fade`, then
 * `caret`. Custom effects run first so `fade` only sees the text they release, and `caret` lands
 * after any decorated text.
 */
export function resolveStreamEffects(props: StreamEffectProps): StreamEffect[] {
  const effects: StreamEffect[] = []
  if (props.effects) effects.push(...props.effects)
  if (props.fade) effects.push(fade(props.fade === true ? {} : props.fade))
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
    if (typeof child === 'string' || isRevealSpan(child)) {
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

// #region pace

export interface PaceOptions {
  /**
   * Base reveal speed in characters per second.
   * @default 45
   */
  speed?: number
  /**
   * Longest time in milliseconds the reveal may trail the received text. Only when the backlog would
   * exceed this window does the reveal speed up.
   * @default 1000
   */
  lag?: number
}

const DEFAULT_PACE_SPEED = 45
const DEFAULT_PACE_LAG = Infinity

interface PaceState {
  /** Characters released so far. Fractional so slow speeds advance smoothly between renders. */
  progress: number
  /** Characters received in the last render. */
  total: number
  /** Time of the previous render, `undefined` before the first one. */
  at: number | undefined
  /** Whether the last render was streaming, so the backlog still drains after the stream ends. */
  streamed: boolean
}

interface PaceCursor {
  /** Characters consumed so far in document order. */
  pos: number
  released: number
}

interface PaceController {
  init: () => PaceState
  pending: (state: PaceState) => boolean
  apply: (nodes: Node[], streaming: boolean, now: number, state: PaceState) => Node[]
}

/**
 * Reveal streamed text at a steady pace, independent of how fast the model sends it.
 *
 * Text past the released cursor is removed from the tree, and elements that have not started yet are
 * dropped. Place it before `fade` and `caret` so they only see released text, or pass `pace` to
 * `fade` or `typewriter` to pace them directly.
 */
export function pace(options: PaceOptions = {}): StreamEffect<PaceState> {
  const controller = createPace(options)
  return {
    name: 'pace',
    init: controller.init,
    pending: controller.pending,
    apply: (nodes, { streaming, now, state }) => controller.apply(nodes, streaming, now, state),
  }
}

/** Pacing rules shared by {@link pace} and the `pace` option of {@link fade} and {@link typewriter}. */
function createPace(options: PaceOptions = {}): PaceController {
  const speed = Math.max(0, options.speed ?? DEFAULT_PACE_SPEED)
  const lag = Math.max(0, options.lag ?? DEFAULT_PACE_LAG)

  return {
    init: () => ({ progress: 0, total: 0, at: undefined, streamed: false }),
    pending: (state) => state.progress < state.total,
    apply(nodes, streaming, now, state) {
      let total = 0
      for (const node of nodes) total += textLength(node, 0)
      state.total = total

      // Static documents show at once. Only a stream, or the drain after it, is paced.
      if (!streaming && !state.streamed) state.progress = total
      // A stream that starts over text already shown must pace that text, so restart the reveal from the
      // beginning rather than treating it as released.
      if (streaming && !state.streamed) state.progress = 0
      if (state.progress > total) state.progress = total

      const backlog = total - state.progress
      // Time only counts while text was already waiting, so idle time before the first chunk is not backlog.
      const dt = state.at === undefined ? 0 : now - state.at
      state.at = backlog > 0 ? now : undefined
      if (backlog > 0) {
        const allowed = (speed * lag) / 1000
        const excess = lag === Infinity ? 0 : Math.max(0, backlog - allowed)
        const rate = speed + (excess * 1000) / lag
        state.progress = rate === Infinity ? total : Math.min(total, state.progress + (rate * dt) / 1000)
      }
      state.streamed = streaming || state.progress < total

      const cursor: PaceCursor = { pos: 0, released: Math.floor(state.progress) }
      let out: Node[] | null = null
      for (let i = 0; i < nodes.length; i++) {
        const kept = clip(nodes[i], cursor, 0)
        if (kept === nodes[i]) out?.push(kept)
        else {
          out ??= nodes.slice(0, i)
          if (kept) out.push(kept)
        }
      }
      return out ?? nodes
    },
  }
}

function textLength(node: Node, depth: number): number {
  if (typeof node === 'string') return node.length
  if (node[0] === null || depth >= MAX_DEPTH) return 0
  let length = 0
  for (let i = 2; i < node.length; i++) length += textLength(node[i] as Node, depth + 1)
  return length
}

/**
 * Keep the released part of `node`. Returns `node` itself when nothing changes, and `null` when the
 * node has not started. Text-free elements show once the cursor reaches them.
 */
function clip(node: Node, cursor: PaceCursor, depth: number): Node | null {
  if (typeof node === 'string') {
    const start = cursor.pos
    cursor.pos += node.length
    if (start >= cursor.released) return null
    if (cursor.pos <= cursor.released) return node
    return node.slice(0, cursor.released - start)
  }
  if (node[0] === null) return node
  if (depth >= MAX_DEPTH) return null

  const start = cursor.pos
  const length = textLength(node, depth)
  if (length === 0 ? start > cursor.released : start >= cursor.released) {
    cursor.pos += length
    return null
  }

  let copy: Node[] | null = null
  for (let i = 2; i < node.length; i++) {
    const child = node[i] as Node
    const kept = clip(child, cursor, depth + 1)
    if (kept === child) copy?.push(child)
    else {
      copy ??= node.slice(0, i) as Node[]
      if (kept) copy.push(kept)
    }
  }
  return copy ? (copy as unknown as ElementNode) : node
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
   * Delay in milliseconds between consecutive words (or characters, with `unit: 'char'`). `0` fades
   * each streamed chunk as a whole. Units queue across chunks, and the queue never lags more than
   * `duration` behind.
   * @default 0 for `unit: 'word'`, 20 for `unit: 'char'`
   */
  stagger?: number
  /**
   * Fade in whole words, or one character at a time.
   * @default 'word'
   */
  unit?: 'word' | 'char'
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
  /**
   * Reveal text at a steady pace (see {@link pace}) before it fades in. `true` uses the pace defaults,
   * `false` turns pacing off.
   * @default true
   */
  pace?: boolean | PaceOptions
}

/** Tags that never fade by default: code and rendered output that would re-mount or break if split. */
export const DEFAULT_FADE_EXCLUDE: readonly string[] = ['pre', 'math', 'mermaid', 'svg', 'script', 'style', 'textarea']

const FADE_CLASS = 'comark-fade'
const FADE_KEY_PREFIX = 'comark-fade:'
const DEFAULT_DURATION = 300
const DEFAULT_CHAR_STAGGER = 20

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
  /** Length of `text` that has been decided. Less than `text.length` while a partial word is held back. */
  shown: number
}

interface RevealState {
  source: readonly Node[] | null
  blocks: FadeBlock[]
  /** Earliest start for the next staggered unit. */
  nextAt: number
  /** Pace state when the `pace` option is set. */
  paced?: PaceState
}

interface RevealConfig {
  name: string
  /** Split new text into words (fade) or characters (typewriter). */
  unit: 'word' | 'char'
  /** Time between consecutive units. `0` reveals each streamed chunk as a whole. */
  stagger: number
  /** Animation length, which also decides when a block's spans merge back into text. */
  duration: number
  /** Furthest a queued unit may start past `now`. */
  lagCap: number
  keyPrefix: string
  className: string
  inlineStyle: string
  styles: { id: string; css: string } | false
  exclude: ReadonlySet<string>
  paceController?: PaceController
}

function isRevealSpan(node: Node): boolean {
  const key = getStreamKey(node)
  return key !== undefined && (key.startsWith(FADE_KEY_PREFIX) || key.startsWith(TYPEWRITER_KEY_PREFIX))
}

/**
 * Fade in text as it streams.
 *
 * Diffs each top-level block's text against what was shown last render: only characters past the
 * common prefix are new, so restructuring (a paragraph turning into a heading, auto-closed markup,
 * linkified URLs) never replays the fade on text already on screen. New characters are wrapped in
 * keyed spans that merge back into plain text once the block's last animation finishes.
 */
export function fade(options: FadeOptions = {}): StreamEffect<RevealState> {
  const duration = options.duration ?? DEFAULT_DURATION
  const unit = options.unit ?? 'word'

  let inlineStyle = ''
  if (options.duration !== undefined) inlineStyle += `animation-duration:${duration}ms;`
  if (options.easing !== undefined) inlineStyle += `animation-timing-function:${options.easing};`

  return createRevealEffect({
    name: 'fade',
    unit,
    stagger: Math.max(0, options.stagger ?? (unit === 'char' ? DEFAULT_CHAR_STAGGER : 0)),
    duration,
    lagCap: duration,
    keyPrefix: FADE_KEY_PREFIX,
    className: options.class ?? FADE_CLASS,
    inlineStyle,
    styles: (options.styles ?? options.class === undefined) ? { id: 'fade', css: FADE_STYLES } : false,
    exclude: new Set(options.exclude ?? DEFAULT_FADE_EXCLUDE),
    paceController: resolveRevealPace(options.pace),
  })
}

function resolveRevealPace(option: boolean | PaceOptions | undefined): PaceController | undefined {
  return option === false ? undefined : createPace(option === undefined || option === true ? {} : option)
}

function createRevealEffect(config: RevealConfig): StreamEffect<RevealState> {
  const { name, unit, stagger, duration, lagCap, keyPrefix, className, inlineStyle, styles, exclude, paceController } =
    config

  const isExcluded = (node: ElementNode) =>
    exclude.has(node[0]) || isRevealSpan(node) || getStreamKey(node) === CARET_KEY

  function fadeableText(node: Node, depth: number): string {
    if (typeof node === 'string') return node
    if (node[0] === null || depth >= MAX_DEPTH || isExcluded(node as ElementNode)) return ''
    let out = ''
    for (let i = 2; i < node.length; i++) out += fadeableText(node[i] as Node, depth + 1)
    return out
  }

  /**
   * Offset in `fadeableText(node)` where its last non-empty text leaf starts. Text before it is
   * complete, so only the trailing word of that leaf can still grow.
   */
  function lastLeafStart(node: Node): number {
    let offset = 0
    let start = 0
    const walk = (n: Node, depth: number) => {
      if (typeof n === 'string') {
        if (n.length > 0) start = offset
        offset += n.length
        return
      }
      if (n[0] === null || depth >= MAX_DEPTH || isExcluded(n as ElementNode)) return
      for (let i = 2; i < n.length; i++) walk(n[i] as Node, depth + 1)
    }
    walk(node, 0)
    return start
  }

  function addSegments(
    segments: FadeSegment[],
    text: string,
    start: number,
    limit: number,
    now: number,
    state: RevealState
  ): void {
    if (stagger === 0) {
      segments.push({ start, end: limit, born: now, delay: 0 })
      return
    }
    let i = start
    while (i < limit) {
      let end = i
      if (unit === 'char') {
        const code = text.charCodeAt(i)
        // Keep surrogate pairs (emoji) in one unit so they are never split across spans.
        end += code >= 0xd800 && code <= 0xdbff && i + 1 < limit ? 2 : 1
      } else {
        while (end < limit && !isSpace(text.charCodeAt(end))) end++
        while (end < limit && isSpace(text.charCodeAt(end))) end++
      }
      const at = Math.max(now, Math.min(state.nextAt, now + lagCap))
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
        { $: { key: keyPrefix + from }, class: className, ...(style ? { style } : {}) },
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
    name,
    init: () => ({ source: null, blocks: [], nextAt: 0, paced: paceController?.init() }),
    pending: paceController
      ? (state) =>
          (state.paced !== undefined && paceController.pending(state.paced)) ||
          state.blocks.some((block) => block.shown < block.text.length)
      : undefined,
    apply(input, { streaming: inputStreaming, now, state }) {
      const paced = state.paced
      const nodes = paceController && paced ? paceController.apply(input, inputStreaming, now, paced) : input
      const streaming = paced ? paced.streamed : inputStreaming
      const previous = state.source
      state.source = nodes
      const blocks = state.blocks
      let out: Node[] | null = null
      let active = false

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i]
        const block = blocks[i]
        if (block && block.segments.length === 0 && block.shown === block.text.length && previous?.[i] === node) {
          out?.push(node)
          continue
        }

        const text = fadeableText(node, 0)
        // Only the last top-level node can still grow, so only it may end mid-word. Earlier blocks are complete.
        const growing = streaming && unit === 'word' && paceController !== undefined && i === nodes.length - 1
        const leaf = growing ? lastLeafStart(node) : text.length
        const hold = growing ? leaf + wordStart(text.slice(leaf)) : text.length
        const flushing = block !== undefined && block.shown < block.text.length
        const common = block ? Math.min(commonPrefixLength(block.text, text), block.shown) : streaming ? 0 : text.length
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
        if ((streaming || flushing) && hold > common) addSegments(segments, text, common, hold, now, state)
        blocks[i] = { text, segments, shown: hold }
        if (segments.length === 0 && hold === text.length) {
          out?.push(node)
          continue
        }

        active = true
        out ??= nodes.slice(0, i)
        // Text past `hold` stays hidden: it is not a span yet, so it must not render as plain text.
        const visible = hold < text.length ? clip(node, { pos: 0, released: hold }, 0) : node
        if (visible === null) continue
        if (typeof visible === 'string') {
          out.push(...(splitText(visible, 0, segments) ?? [visible]))
        } else {
          out.push(
            (visible[0] !== null && decorate(visible as ElementNode, segments, { value: 0 }, 0)) ||
              (visible as ElementNode)
          )
        }
      }
      blocks.length = nodes.length

      if (active && styles) injectStreamStyles(styles.id, styles.css)
      return out ?? nodes
    },
  }
}

// #endregion

// #region typewriter

export interface TypewriterOptions {
  /**
   * Characters revealed per second. `0` or `Infinity` reveals each streamed chunk at once.
   * @default 60
   */
  speed?: number
  /**
   * Class on revealing characters. Setting it turns `styles` off by default so your own CSS drives
   * the reveal.
   * @default 'comark-typewriter'
   */
  class?: string
  /**
   * Add the default keyframes ({@link TYPEWRITER_STYLES}) to the document the first time something
   * is revealed. Turn off when shipping them yourself, e.g. inside a shadow root.
   * @default true unless `class` is set
   */
  styles?: boolean
  /** Tags whose subtrees are revealed as a whole. Replaces {@link DEFAULT_FADE_EXCLUDE}. */
  exclude?: readonly string[]
  /**
   * Reveal text at a steady pace (see {@link pace}) before it types out. `true` uses the pace defaults,
   * `false` turns pacing off.
   * @default true
   */
  pace?: false | PaceOptions
}

const TYPEWRITER_CLASS = 'comark-typewriter'
const TYPEWRITER_KEY_PREFIX = 'comark-typewriter:'

/** Default typewriter stylesheet, for apps that ship it themselves with `styles: false`. */
export const TYPEWRITER_STYLES = `@keyframes comark-typewriter-in{from{opacity:0}to{opacity:1}}.${TYPEWRITER_CLASS}{animation:comark-typewriter-in 0ms steps(1) both}@media (prefers-reduced-motion:reduce){.${TYPEWRITER_CLASS}{animation:none}}`

/**
 * Type out streamed text one character at a time.
 *
 * Like {@link fade}, new characters are wrapped in keyed spans and merge back into plain text once
 * they have all appeared. Each character gets its own CSS delay, so characters appear in order at
 * `speed`. Text that streams in faster than `speed` queues up, and the queue is not capped, so the
 * text keeps typing out after the stream ends.
 */
export function typewriter(options: TypewriterOptions = {}): StreamEffect<RevealState> {
  const speed = options.speed ?? 100
  return createRevealEffect({
    name: 'typewriter',
    unit: 'char',
    stagger: speed > 0 && Number.isFinite(speed) ? 1000 / speed : 0,
    duration: 0,
    lagCap: Infinity,
    keyPrefix: TYPEWRITER_KEY_PREFIX,
    className: options.class ?? TYPEWRITER_CLASS,
    inlineStyle: '',
    styles: (options.styles ?? options.class === undefined) ? { id: 'typewriter', css: TYPEWRITER_STYLES } : false,
    exclude: new Set(options.exclude ?? DEFAULT_FADE_EXCLUDE),
    paceController: resolveRevealPace(
      options.pace === false
        ? false
        : {
            speed: options.pace?.speed ?? speed,
            lag: options.pace?.lag ?? Infinity,
          }
    ),
  })
}

// #endregion

function commonPrefixLength(a: string, b: string): number {
  const max = Math.min(a.length, b.length)
  let i = 0
  while (i < max && a.charCodeAt(i) === b.charCodeAt(i)) i++
  return i
}

function isSpace(code: number): boolean {
  return code === 32 || code === 9 || code === 10 || code === 13
}

/** Offset where the trailing non-space run of `text` starts, or `text.length` when it ends in a space. */
function wordStart(text: string): number {
  let i = text.length
  while (i > 0 && !isSpace(text.charCodeAt(i - 1))) i--
  return i
}

// #endregion

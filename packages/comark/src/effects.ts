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
  /**
   * Whether an earlier effect still holds text back (e.g. {@link pace}), so the input may be cut
   * mid-word and the renderer keeps rendering without new input.
   */
  backlog: boolean
}

/** A render-time transform of the top-level nodes. */
export interface StreamEffect<TState = any> {
  /** Unique name. State is keyed by it, so recreating an effect object keeps its state. */
  name: string
  /** Create the initial state on first use. */
  init?: () => TState
  /** Return decorated nodes. Must not mutate `nodes` or any node inside it. */
  apply: (nodes: Node[], context: StreamEffectContext<TState>) => Node[]
  /**
   * Whether text is still held back and the renderer must render again without new input. Later
   * effects then see `streaming` and `backlog` as `true`.
   */
  pending?: (state: TState) => boolean
  /**
   * Whether the effect needs another render to clean up its own decoration (e.g. merging finished
   * fade spans back into text). Keeps the renderer scheduling frames like {@link pending}, but holds
   * no text back, so later effects see the real `streaming` and `backlog`.
   */
  settling?: (state: TState) => boolean
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
  /**
   * Whether the last `render` left work queued or decoration to settle, so the renderer should
   * schedule another frame.
   */
  pending: () => boolean
  /** Drop all effect state, e.g. when the renderer shows a different document. */
  reset: () => void
}

export interface StreamRendererOptions {
  /** Clock used for effect timing. Defaults to `performance.now()`. */
  now?: () => number
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
      let backlog = false
      for (const effect of effects) {
        if (!states.has(effect.name)) states.set(effect.name, effect.init?.())
        const state = states.get(effect.name)
        out = effect.apply(out, { streaming: streamingNow, now: time, state, backlog })
        if (effect.pending?.(state)) {
          backlog = true
          streamingNow = true
        } else if (effect.settling?.(state)) {
          pending = true
        }
      }
      if (backlog) pending = true
      return out
    },
    pending: () => pending,
    reset() {
      states.clear()
      pending = false
    },
  }
}

/** Render-time key for a node, set by stream effects in `$.key`. */
export function getStreamKey(node: Node): string | undefined {
  if (!Array.isArray(node)) return undefined
  const key = (node[1] as ElementNode[1] | undefined)?.$?.key
  return typeof key === 'string' ? key : undefined
}

/**
 * Stable keys for rendering `children`. Nodes an effect inserted use their `$.key` (prefixed with `$`,
 * so they never collide with generated keys); other elements and text are numbered separately, so
 * splitting a text node into text and spans never shifts the key of a sibling element (which would
 * re-mount it).
 */
export function getChildKeys(children: readonly Node[]): string[] {
  const keys: string[] = new Array(children.length)
  let elements = 0
  let texts = 0
  for (let i = 0; i < children.length; i++) {
    const child = children[i]
    const key = getStreamKey(child)
    keys[i] = key !== undefined ? `$${key}` : typeof child === 'string' ? `t${texts++}` : String(elements++)
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

// #region text measure

interface TextMeasure {
  /** Text length of `node`. Opaque elements and subtrees past the depth limit count no text. */
  length: (node: Node, depth: number) => number
}

/**
 * Text lengths cached by node identity. Streaming keeps unchanged blocks identical between renders and
 * effects never mutate nodes, so each frame only measures the blocks that changed.
 */
function createTextMeasure(
  isOpaque?: (node: ElementNode) => boolean,
  isUnit?: (node: ElementNode) => boolean
): TextMeasure {
  // `height` is how many element levels the subtree spans, so a length is reused only at depths where
  // the depth limit cuts nothing from it.
  const cache = new WeakMap<ElementNode, { total: number; height: number }>()
  let truncated = false
  let reach = 0

  function length(node: Node, depth: number): number {
    if (typeof node === 'string') return node.length
    if (node[0] === null) return 0
    if (depth >= MAX_DEPTH) {
      truncated = true
      return 0
    }
    const element = node as ElementNode
    const cached = cache.get(element)
    if (cached !== undefined && depth + cached.height < MAX_DEPTH) {
      reach = Math.max(reach, depth + cached.height)
      return cached.total
    }
    if (isOpaque?.(element)) {
      cache.set(element, { total: 0, height: 0 })
      reach = Math.max(reach, depth)
      return 0
    }
    if (isUnit?.(element)) {
      cache.set(element, { total: 1, height: 0 })
      reach = Math.max(reach, depth)
      return 1
    }
    const outerTruncated = truncated
    const outerReach = reach
    truncated = false
    reach = depth
    let total = 0
    for (let i = 2; i < element.length; i++) total += length(element[i] as Node, depth + 1)
    // A subtree cut by the depth limit measures differently at another depth, so it is not cached.
    if (!truncated) cache.set(element, { total, height: reach - depth })
    truncated ||= outerTruncated
    reach = Math.max(reach, outerReach)
    return total
  }

  return { length }
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
   * Catch up when the reveal falls more than this many milliseconds behind the received text. Below
   * that the reveal keeps its `speed`; above it, it speeds up so no text waits longer than this.
   * @default Infinity
   */
  catchUp?: number
  /**
   * Tags whose subtrees count no text and show whole once the reveal reaches them, so code blocks and
   * rendered output never appear half-typed. Replaces {@link DEFAULT_FADE_EXCLUDE}.
   */
  exclude?: readonly string[]
}

const DEFAULT_PACE_SPEED = 45
const DEFAULT_PACE_CATCH_UP = Infinity

interface PaceState {
  /** Characters released so far. Fractional so slow speeds advance smoothly between renders. */
  progress: number
  /** Characters received in the last render. */
  total: number
  /** Time of the previous render while a backlog was waiting, `undefined` when idle. */
  at: number | undefined
  /** Per received chunk, the text end it must be released up to, and by when, to stay within `catchUp`. */
  deadlines: { end: number; at: number }[]
  /** Whether the last render was streaming, so the backlog still drains after the stream ends. */
  streamed: boolean
  /** Whether a render has run. The first one shows its input at once. */
  started: boolean
}

interface PaceCursor {
  /** Characters consumed so far in document order. */
  pos: number
  released: number
}

/**
 * Reveal streamed text at a steady pace, independent of how fast the model sends it.
 *
 * Text past the released cursor is removed from the tree, and elements that have not started yet are
 * dropped. The first render shows its input at once, so server rendering and hydration contain the
 * text; only text that arrives later is paced. Place it before `fade`, `typewriter` and `caret` so
 * they only see released text: `[pace(), fade(), caret()]`.
 */
export function pace(options: PaceOptions = {}): StreamEffect<PaceState> {
  const speed = Math.max(0, options.speed ?? DEFAULT_PACE_SPEED)
  const catchUp = Math.max(0, options.catchUp ?? DEFAULT_PACE_CATCH_UP)
  const exclude = new Set(options.exclude ?? DEFAULT_FADE_EXCLUDE)
  const measure = createTextMeasure((node) => exclude.has(node[0]))

  return {
    name: 'pace',
    init: () => ({ progress: 0, total: 0, at: undefined, deadlines: [], streamed: false, started: false }),
    pending: (state) => state.progress < state.total,
    apply(nodes, { streaming, now, state }) {
      let total = 0
      for (let i = 0; i < nodes.length; i++) total += measure.length(nodes[i], 0)
      const grew = total > state.total
      state.total = total

      // The first render shows what is already there, so a server render and its hydration match.
      if (!state.started) state.progress = total
      // Static documents show at once. Only a stream, or the drain after it, is paced.
      else if (!streaming && !state.streamed) state.progress = total
      // A stream that starts over text already shown must pace that text, so restart the reveal from the
      // beginning rather than treating it as released.
      else if (streaming && !state.streamed) state.progress = 0
      state.started = true
      if (state.progress > total) state.progress = total

      // Time only counts while text was already waiting, so idle time before a chunk is not backlog.
      const previousAt = state.at
      const dt = previousAt === undefined ? 0 : now - previousAt
      if (grew && catchUp !== Infinity) state.deadlines.push({ end: total, at: now + catchUp })
      const backlog = total - state.progress
      if (backlog > 0) {
        if (speed === Infinity) state.progress = total
        else if (dt > 0) {
          let release = (speed * dt) / 1000
          // Catching up toward each chunk's fixed deadline keeps the catch-up bound independent of the frame
          // rate, and later chunks never postpone text already waiting.
          for (const deadline of state.deadlines) {
            const need = Math.min(deadline.end, total) - state.progress
            const left = deadline.at - previousAt!
            if (need > 0) release = Math.max(release, left <= dt ? need : (need * dt) / left)
          }
          state.progress = Math.min(total, state.progress + release)
        }
      }
      if (state.progress < total) state.at = now
      else state.at = undefined
      const progress = state.progress
      if (state.deadlines.length > 0) state.deadlines = state.deadlines.filter((deadline) => deadline.end > progress)
      state.streamed = streaming || state.progress < total

      const released = Math.floor(state.progress)
      if (released >= total) return nodes
      const cursor: PaceCursor = { pos: 0, released }
      let out: Node[] | null = null
      for (let i = 0; i < nodes.length; i++) {
        const kept = clip(nodes[i], cursor, 0, measure)
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

/**
 * Keep the released part of `node`. Returns `node` itself when nothing changes, and `null` when the
 * node has not started. Only the element holding the cursor is walked; with cached lengths, elements
 * before or after it cost O(1).
 */
function clip(node: Node, cursor: PaceCursor, depth: number, measure: TextMeasure): Node | null {
  if (typeof node === 'string') {
    const start = cursor.pos
    cursor.pos += node.length
    if (start >= cursor.released) return null
    if (cursor.pos <= cursor.released) return node
    let end = cursor.released - start
    // Never split a surrogate pair (emoji): release the low half with its high half.
    const code = node.charCodeAt(end - 1)
    if (code >= 0xd800 && code <= 0xdbff) end++
    return node.slice(0, end)
  }
  if (node[0] === null) return node

  const start = cursor.pos
  const length = measure.length(node, depth)
  // Text-free, opaque, and too-deep elements count no text and show whole once the cursor reaches them.
  if (length === 0) return start > cursor.released ? null : node
  if (start >= cursor.released) {
    cursor.pos = start + length
    return null
  }
  if (start + length <= cursor.released) {
    cursor.pos = start + length
    return node
  }

  let copy: Node[] | null = null
  for (let i = 2; i < node.length; i++) {
    const child = node[i] as Node
    const kept = clip(child, cursor, depth + 1, measure)
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

/** A CSS `animation-timing-function` value. */
export type FadeEasing =
  | 'linear'
  | 'ease'
  | 'ease-in'
  | 'ease-out'
  | 'ease-in-out'
  | 'step-start'
  | 'step-end'
  | `cubic-bezier(${string})`
  | `steps(${string})`
  | `linear(${string})`
  | `var(${string})`

/** Options for {@link fade}. Combine with {@link pace} to release text at a steady rate. */
export interface FadeOptions {
  /**
   * Animation duration in milliseconds. A block's spans merge back into plain text this long after
   * its last chunk starts fading.
   * @default 300
   */
  duration?: number
  /** @default 'ease-out' */
  easing?: FadeEasing
  /**
   * Built-in animation: `fade` animates opacity, `blur` also sharpens from a 4px blur, and `slide`
   * also rises `0.25em`. Ignored when `class` is set.
   * @default 'fade'
   */
  animation?: FadeAnimation
  /**
   * Delay in milliseconds between consecutive words (or characters, with `unit: 'char'`). `0` fades
   * each streamed chunk as a whole. Units queue across chunks, and the queue never falls more than
   * `duration` behind.
   * @default 30 for `unit: 'word'`, 20 for `unit: 'char'`
   */
  delay?: number
  /**
   * Fade in whole words, or one character at a time.
   * @default 'word'
   */
  unit?: 'word' | 'char'
  /**
   * Class on fading spans and on images, rules, and checkboxes that fade in. A new list item also gets
   * `<class>-marker`, with its timing in the `--comark-fade-delay`, `--comark-fade-duration`, and
   * `--comark-fade-easing` custom properties, so CSS can fade its `::marker`. Setting it turns `styles`
   * off by default so your own CSS drives the animation.
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

/** Built-in animations of {@link fade}. */
export type FadeAnimation = 'fade' | 'blur' | 'slide'

/**
 * Tags with no text of their own that still fade in. Each counts as one character of the block's
 * fadeable text, so inserting one is detected like new text.
 */
export const FADE_UNIT_TAGS: readonly string[] = ['img', 'hr', 'input']

const UNIT_TAGS: ReadonlySet<string> = new Set(FADE_UNIT_TAGS)

const FADE_CLASS = 'comark-fade'
const FADE_KEY_PREFIX = 'comark-fade:'
const DEFAULT_DURATION = 300
const DEFAULT_WORD_DELAY = 30
const DEFAULT_CHAR_DELAY = 20
/** Stands in for a {@link FADE_UNIT_TAGS} element in a block's fadeable text. */
const UNIT_CHAR = '\uFFFC'
const UNIT_CODE = 0xfffc

/**
 * Default fade stylesheet, for apps that ship it themselves with `styles: false`. `slide` animates
 * `top` on a relatively positioned span because `transform` does not apply to inline boxes, and
 * `inline-block` would drop the trailing space each word span carries.
 */
export const FADE_STYLES =
  '@keyframes comark-fade-in{from{opacity:0}to{opacity:1}}' +
  '@keyframes comark-blur-in{from{opacity:0;filter:blur(4px)}to{opacity:1;filter:none}}' +
  '@keyframes comark-slide-in{from{opacity:0;top:.25em}to{opacity:1;top:0}}' +
  '@keyframes comark-marker-in{from{color:transparent}}' +
  `.${FADE_CLASS}{animation:comark-fade-in ${DEFAULT_DURATION}ms ease-out both}` +
  `.${FADE_CLASS}-blur{animation-name:comark-blur-in}` +
  `.${FADE_CLASS}-slide{position:relative;animation-name:comark-slide-in}` +
  `.${FADE_CLASS}-marker::marker{animation:comark-marker-in var(--comark-fade-duration,${DEFAULT_DURATION}ms) var(--comark-fade-easing,ease-out) var(--comark-fade-delay,0ms) both}` +
  `@media (prefers-reduced-motion:reduce){.${FADE_CLASS},.${FADE_CLASS}-marker::marker{animation:none}}`

interface FadeSegment {
  /** Offset range in the block's fadeable text. */
  start: number
  end: number
  /** When the span appears; its animation starts `delay` ms later. */
  born: number
  delay: number
  /** Inline style of the span, including its delay. */
  style: string
}

interface FadeBlock {
  text: string
  segments: FadeSegment[]
  /** Length of `text` that has been decided. Less than `text.length` while a partial word is held back. */
  shown: number
  /** When the last segment finishes animating, so the spans can merge back into text. */
  until: number
}

interface BlockText {
  /** Fadeable text: every text leaf outside excluded subtrees, in document order. */
  text: string
  /** Offset where the last non-empty text leaf starts. Only its trailing word can still grow. */
  leaf: number
}

/** Position in a block's fadeable text while decorating it, and the first segment that may still apply. */
interface TextCursor {
  pos: number
  segment: number
}

interface RevealState {
  source: readonly Node[] | null
  blocks: FadeBlock[]
  /** Earliest start for the next queued unit. */
  nextAt: number
  /** Whether the previous render was streaming, so the chunk that closes the stream still fades. */
  streamed: boolean
}

interface RevealConfig {
  name: string
  /** Split new text into words (fade) or characters (typewriter). */
  unit: 'word' | 'char'
  /** Time between consecutive units. `0` reveals each streamed chunk as a whole. */
  interval: number
  /** Animation length, which also decides when a block's spans merge back into text. */
  duration: number
  /** Furthest a queued unit may start past `now`. */
  maxQueue: number
  keyPrefix: string
  className: string
  inlineStyle: string
  /** Class for a new list item so CSS can fade its `::marker`, or `null` to leave markers alone. */
  markerClass: string | null
  /** Custom properties every stamped list item carries, before its delay. */
  markerStyle: string
  styles: { id: string; css: string } | false
  exclude: ReadonlySet<string>
}

const EMPTY_TEXT: BlockText = { text: '', leaf: 0 }

function isRevealKey(key: string): boolean {
  return key.startsWith(FADE_KEY_PREFIX) || key.startsWith(TYPEWRITER_KEY_PREFIX)
}

function isRevealSpan(node: Node): boolean {
  const key = getStreamKey(node)
  return key !== undefined && isRevealKey(key)
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

  const animation = options.animation ?? 'fade'

  let inlineStyle = ''
  let markerStyle = ''
  if (options.duration !== undefined) {
    inlineStyle += `animation-duration:${duration}ms;`
    markerStyle += `--comark-fade-duration:${duration}ms;`
  }
  if (options.easing !== undefined) {
    inlineStyle += `animation-timing-function:${options.easing};`
    markerStyle += `--comark-fade-easing:${options.easing};`
  }

  return createRevealEffect({
    name: 'fade',
    unit,
    interval: Math.max(0, options.delay ?? (unit === 'char' ? DEFAULT_CHAR_DELAY : DEFAULT_WORD_DELAY)),
    duration,
    maxQueue: duration,
    keyPrefix: FADE_KEY_PREFIX,
    className: options.class ?? (animation === 'fade' ? FADE_CLASS : `${FADE_CLASS} ${FADE_CLASS}-${animation}`),
    inlineStyle,
    markerClass: `${options.class ?? FADE_CLASS}-marker`,
    markerStyle,
    styles: (options.styles ?? options.class === undefined) ? { id: 'fade', css: FADE_STYLES } : false,
    exclude: new Set(options.exclude ?? DEFAULT_FADE_EXCLUDE),
  })
}

function createRevealEffect(config: RevealConfig): StreamEffect<RevealState> {
  const { name, unit, interval, duration, maxQueue, keyPrefix, className, inlineStyle, styles, exclude } = config
  const { markerClass, markerStyle } = config

  const isExcluded = (node: ElementNode): boolean => {
    if (exclude.has(node[0])) return true
    const key = getStreamKey(node)
    return key !== undefined && (key === CARET_KEY || isRevealKey(key))
  }
  const isUnit = (node: ElementNode): boolean => UNIT_TAGS.has(node[0])
  const measure = createTextMeasure(isExcluded, isUnit)
  // Only top-level blocks are cached: they are always read at depth 0, so the depth limit cuts them
  // the same way every time.
  const texts = new WeakMap<ElementNode, BlockText>()

  function collectText(node: Node, depth: number, acc: BlockText): void {
    if (typeof node === 'string') {
      if (node.length > 0) {
        acc.leaf = acc.text.length
        acc.text += node
      }
      return
    }
    if (node[0] === null || depth >= MAX_DEPTH || isExcluded(node as ElementNode)) return
    if (isUnit(node as ElementNode)) {
      acc.leaf = acc.text.length
      acc.text += UNIT_CHAR
      return
    }
    for (let i = 2; i < node.length; i++) collectText(node[i] as Node, depth + 1, acc)
  }

  function blockText(node: Node): BlockText {
    if (typeof node === 'string') return { text: node, leaf: 0 }
    if (node[0] === null) return EMPTY_TEXT
    const element = node as ElementNode
    let cached = texts.get(element)
    if (!cached) {
      cached = { text: '', leaf: 0 }
      collectText(element, 0, cached)
      texts.set(element, cached)
    }
    return cached
  }

  function segmentStyle(delay: number): string {
    return delay > 0 ? `${inlineStyle}animation-delay:${delay}ms;` : inlineStyle
  }

  function addSegments(
    segments: FadeSegment[],
    text: string,
    start: number,
    limit: number,
    now: number,
    state: RevealState
  ): void {
    if (interval === 0) {
      segments.push({ start, end: limit, born: now, delay: 0, style: inlineStyle })
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
        // Leading space (at the start of a chunk) joins the next word instead of fading on its own.
        while (end < limit && isSpace(text.charCodeAt(end))) end++
        // Scripts written without spaces (CJK) and unit elements fade one character at a time.
        const single = end < limit ? breakWidth(text, end, limit) : 0
        if (single > 0) end += single
        else while (end < limit && !isSpace(text.charCodeAt(end)) && breakWidth(text, end, limit) === 0) end++
        // Space after a unit element sits in the next text leaf, so it leads the next word instead.
        if (text.charCodeAt(end - 1) !== UNIT_CODE) while (end < limit && isSpace(text.charCodeAt(end))) end++
      }
      const at = Math.max(now, Math.min(state.nextAt, now + maxQueue))
      state.nextAt = at + interval
      const delay = Math.round(at - now)
      segments.push({ start: i, end, born: now, delay, style: segmentStyle(delay) })
      i = end
    }
  }

  /**
   * Split one text leaf at `cursor` into plain text and spans, or return `null` when no segment
   * touches it. Segments are sorted and leaves arrive in order, so the scan resumes where the previous
   * leaf stopped instead of starting over.
   */
  function splitText(text: string, cursor: TextCursor, segments: FadeSegment[], prefix: string): Node[] | null {
    const offset = cursor.pos
    const end = offset + text.length
    cursor.pos = end
    let k = cursor.segment
    while (k < segments.length && segments[k].end <= offset) k++
    let pieces: Node[] | null = null
    let at = offset
    for (; k < segments.length; k++) {
      const segment = segments[k]
      if (segment.start >= end) break
      pieces ??= []
      const from = Math.max(segment.start, at)
      const to = Math.min(segment.end, end)
      if (from > at) pieces.push(text.slice(at - offset, from - offset))
      const key = { key: prefix + from }
      pieces.push([
        'span',
        segment.style ? { $: key, class: className, style: segment.style } : { $: key, class: className },
        text.slice(from - offset, to - offset),
      ])
      at = to
      // The segment continues into the next leaf, which resumes from it.
      if (segment.end > end) break
    }
    cursor.segment = k
    if (pieces && at < end) pieces.push(text.slice(at - offset))
    return pieces
  }

  /** The segment covering `cursor.pos`, if any. Advances `cursor.segment` past segments that ended. */
  function segmentAt(cursor: TextCursor, segments: FadeSegment[]): FadeSegment | undefined {
    let k = cursor.segment
    while (k < segments.length && segments[k].end <= cursor.pos) k++
    cursor.segment = k
    const segment = segments[k]
    return segment !== undefined && segment.start <= cursor.pos ? segment : undefined
  }

  /** Returns the decorated copy of `node`, or `null` when unchanged. */
  function decorate(node: ElementNode, segments: FadeSegment[], cursor: TextCursor, depth: number): ElementNode | null {
    if (depth >= MAX_DEPTH || isExcluded(node)) return null
    if (isUnit(node)) {
      const segment = segmentAt(cursor, segments)
      cursor.pos += 1
      if (!segment) return null
      const copy = node.slice() as ElementNode
      copy[1] = withClassAndStyle(node[1], className, segment.style)
      return copy
    }
    // A list item whose first character is fading is new, so its marker fades in with it.
    const marker = markerClass !== null && node[0] === 'li' ? segmentAt(cursor, segments) : undefined
    let copy: Node[] | null = null
    for (let i = 2; i < node.length; i++) {
      const child = node[i] as Node
      if (typeof child === 'string') {
        const pieces = splitText(child, cursor, segments, keyPrefix)
        if (pieces) {
          copy ??= node.slice(0, i) as Node[]
          for (let j = 0; j < pieces.length; j++) copy.push(pieces[j])
          continue
        }
      } else if (child[0] !== null) {
        const updated = decorate(child as ElementNode, segments, cursor, depth + 1)
        if (updated) {
          copy ??= node.slice(0, i) as Node[]
          copy.push(updated)
          continue
        }
      }
      copy?.push(child)
    }
    if (marker) {
      const stamped = (copy ?? node.slice()) as unknown as ElementNode
      // Always set the delay so a nested item never inherits its parent's.
      stamped[1] = withClassAndStyle(node[1], markerClass!, `${markerStyle}--comark-fade-delay:${marker.delay}ms;`)
      return stamped
    }
    return copy as ElementNode | null
  }

  return {
    name,
    init: () => ({ source: null, blocks: [], nextAt: 0, streamed: false }),
    // Spans only merge back during a render, so ask for frames until every block has merged.
    settling: (state) => state.blocks.some((block) => block.segments.length > 0),
    apply(nodes, { streaming, now, state, backlog }) {
      const closing = !streaming && state.streamed
      state.streamed = streaming
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

        const { text, leaf } = blockText(node)
        // An earlier effect with a backlog (pace) cuts text mid-word, so hold the partial word until it is
        // released whole. Only the last top-level node can be cut; earlier blocks are complete.
        const growing = streaming && backlog && unit === 'word' && i === nodes.length - 1
        const hold = growing ? wordStart(text, leaf) : text.length
        const flushing = block !== undefined && block.shown < block.text.length
        const common = block
          ? Math.min(commonPrefixLength(block.text, text), block.shown)
          : streaming || closing
            ? 0
            : text.length
        // A block's spans merge back into text all at once, when its last one finishes. Spans are
        // then only ever appended, so positional keys never move an animating span to a new element.
        const segments: FadeSegment[] = []
        if (block && now < block.until) {
          for (const segment of block.segments) {
            const end = Math.min(segment.end, common)
            if (segment.start < end) segments.push(end === segment.end ? segment : { ...segment, end })
          }
        }
        if ((streaming || closing || flushing) && hold > common) addSegments(segments, text, common, hold, now, state)
        let until = -Infinity
        for (const segment of segments) until = Math.max(until, segment.born + segment.delay + duration)
        blocks[i] = { text, segments, shown: hold, until }
        if (segments.length === 0 && hold === text.length) {
          out?.push(node)
          continue
        }

        active = true
        out ??= nodes.slice(0, i)
        // Text past `hold` stays hidden: it is not a span yet, so it must not render as plain text.
        const visible = hold < text.length ? clip(node, { pos: 0, released: hold }, 0, measure) : node
        if (visible === null) continue
        const cursor: TextCursor = { pos: 0, segment: 0 }
        if (typeof visible === 'string') {
          // Top-level text spans are siblings of other blocks' spans, so their keys include the block.
          const pieces = splitText(visible, cursor, segments, `${keyPrefix}${i}:`)
          if (pieces) for (let j = 0; j < pieces.length; j++) out.push(pieces[j])
          else out.push(visible)
        } else {
          out.push((visible[0] !== null && decorate(visible as ElementNode, segments, cursor, 0)) || visible)
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

/** Options for {@link typewriter}. Combine with {@link pace} to release text at a steady rate. */
export interface TypewriterOptions {
  /**
   * Characters revealed per second. `0` or `Infinity` reveals each streamed chunk at once.
   * @default 100
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
}

const TYPEWRITER_CLASS = 'comark-typewriter'
const TYPEWRITER_KEY_PREFIX = 'comark-typewriter:'
const DEFAULT_TYPEWRITER_SPEED = 100

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
  const speed = options.speed ?? DEFAULT_TYPEWRITER_SPEED
  return createRevealEffect({
    name: 'typewriter',
    unit: 'char',
    interval: speed > 0 && Number.isFinite(speed) ? 1000 / speed : 0,
    duration: 0,
    maxQueue: Infinity,
    keyPrefix: TYPEWRITER_KEY_PREFIX,
    className: options.class ?? TYPEWRITER_CLASS,
    inlineStyle: '',
    markerClass: null,
    markerStyle: '',
    styles: (options.styles ?? options.class === undefined) ? { id: 'typewriter', css: TYPEWRITER_STYLES } : false,
    exclude: new Set(options.exclude ?? DEFAULT_FADE_EXCLUDE),
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
  if (code <= 32) return code === 32 || (code >= 9 && code <= 13)
  if (code < 0xa0) return false
  return (
    code === 0xa0 ||
    code === 0x1680 ||
    (code >= 0x2000 && code <= 0x200a) ||
    code === 0x2028 ||
    code === 0x2029 ||
    code === 0x202f ||
    code === 0x205f ||
    code === 0x3000
  )
}

/** Han, kana, CJK punctuation, fullwidth forms, and the unit placeholder: each is a word on its own. */
function isBreakCode(code: number): boolean {
  return (
    (code >= 0x3001 && code <= 0x30ff) ||
    (code >= 0x3400 && code <= 0x4dbf) ||
    (code >= 0x4e00 && code <= 0x9fff) ||
    (code >= 0xf900 && code <= 0xfaff) ||
    (code >= 0xff00 && code <= 0xffef) ||
    code === 0xfffc
  )
}

/** High surrogates of planes 2 and 3 (U+20000 to U+3FFFF), which hold the CJK ideograph extensions. */
function isCjkHighSurrogate(code: number): boolean {
  return code >= 0xd840 && code <= 0xd8bf
}

/** Length of the standalone word character at `i` (1, or 2 for a surrogate pair), or `0` if there is none. */
function breakWidth(text: string, i: number, limit: number): number {
  const code = text.charCodeAt(i)
  if (isBreakCode(code)) return 1
  return isCjkHighSurrogate(code) && i + 1 < limit ? 2 : 0
}

/**
 * Offset (at least `from`) where the trailing partial word of `text` starts. Returns `text.length`
 * after a space or a standalone word character, which can no longer grow.
 */
function wordStart(text: string, from: number): number {
  let i = text.length
  while (i > from) {
    const code = text.charCodeAt(i - 1)
    if (isSpace(code) || isBreakCode(code)) break
    if (code >= 0xdc00 && code <= 0xdfff && i - 2 >= from && isCjkHighSurrogate(text.charCodeAt(i - 2))) break
    i--
  }
  return i
}

/** Copy `attrs` with `cls` appended to its class and `style` appended to a string style. */
function withClassAndStyle(attrs: ElementNode[1], cls: string, style: string): ElementNode[1] {
  const next: ElementNode[1] = { ...attrs }
  next.class = typeof attrs.class === 'string' && attrs.class ? `${attrs.class} ${cls}` : cls
  if (style) {
    const existing = typeof attrs.style === 'string' ? attrs.style.trimEnd() : ''
    // A non-string style (an object from a component prop) is left alone rather than overwritten.
    if (existing) next.style = existing.endsWith(';') ? existing + style : `${existing};${style}`
    else if (attrs.style === undefined || attrs.style === '') next.style = style
  }
  return next
}

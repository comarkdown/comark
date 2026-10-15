/**
 * Characters that were visible in `prev` but not kept through to `next`.
 * Uses LCS so pure appends score 0 removals, while flicker like
 * `"Hello *"` → `"Hello da"` reports the `*`.
 */
export function getRemovedChars(prev: string, next: string): string {
  if (!prev) return ''
  if (!next) return prev

  const m = prev.length
  const n = next.length

  const dp: Uint16Array[] = Array.from({ length: m + 1 }, () => new Uint16Array(n + 1))
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (prev.charCodeAt(i - 1) === next.charCodeAt(j - 1)) {
        dp[i][j] = dp[i - 1][j - 1] + 1
      } else {
        dp[i][j] = Math.max(dp[i - 1][j], dp[i][j - 1])
      }
    }
  }

  const keep = new Uint8Array(m)
  let i = m
  let j = n
  while (i > 0 && j > 0) {
    if (prev.charCodeAt(i - 1) === next.charCodeAt(j - 1)) {
      keep[i - 1] = 1
      i--
      j--
    } else if (dp[i - 1][j] >= dp[i][j - 1]) {
      i--
    } else {
      j--
    }
  }

  let removed = ''
  for (let k = 0; k < m; k++) {
    if (!keep[k]) removed += prev[k]
  }
  return removed
}

export interface MisrenderEvent {
  /** Frame index when the removal was detected */
  frame: number
  /** Visible text before the update */
  from: string
  /** Visible text after the update */
  to: string
  /** Characters that left the visible text */
  removed: string
  /** Timestamp ms since stream start */
  at: number
}

export interface MisrenderStats {
  frames: number
  misrenderChars: number
  misrenderEvents: number
  events: MisrenderEvent[]
}

export function emptyStats(): MisrenderStats {
  return {
    frames: 0,
    misrenderChars: 0,
    misrenderEvents: 0,
    events: [],
  }
}

/**
 * Compare two consecutive visible-text snapshots and accumulate mis-render stats.
 * Returns the updated previous-text (always `next`).
 */
export function trackFrame(stats: MisrenderStats, prevVisible: string, nextVisible: string, startedAt: number): string {
  stats.frames++

  if (prevVisible && nextVisible !== prevVisible) {
    const removed = getRemovedChars(prevVisible, nextVisible)
    if (removed.length > 0) {
      stats.misrenderChars += removed.length
      stats.misrenderEvents++
      stats.events.push({
        frame: stats.frames,
        from: prevVisible,
        to: nextVisible,
        removed,
        at: performance.now() - startedAt,
      })
    }
  }

  return nextVisible
}

const PRE_TAGS = new Set(['PRE', 'CODE', 'TEXTAREA', 'SAMP', 'KBD'])
const SKIP_TAGS = new Set(['STYLE', 'SCRIPT', 'NOSCRIPT', 'TEMPLATE'])
const BLOCK_TAGS = new Set([
  'ADDRESS',
  'ARTICLE',
  'ASIDE',
  'BLOCKQUOTE',
  'DD',
  'DIV',
  'DL',
  'DT',
  'FIELDSET',
  'FIGCAPTION',
  'FIGURE',
  'FOOTER',
  'FORM',
  'H1',
  'H2',
  'H3',
  'H4',
  'H5',
  'H6',
  'HEADER',
  'HR',
  'LI',
  'MAIN',
  'NAV',
  'OL',
  'P',
  'SECTION',
  'TABLE',
  'TBODY',
  'TD',
  'TFOOT',
  'TH',
  'THEAD',
  'TR',
  'UL',
])

function isPreformatted(el: Element): boolean {
  return PRE_TAGS.has(el.tagName)
}

function isBlockLike(el: Element): boolean {
  return BLOCK_TAGS.has(el.tagName)
}

function isCaretEl(el: Element): boolean {
  if (el.classList.contains('comark-caret')) return true
  const style = el.getAttribute('style') || ''
  return style.includes('animation: pulse')
}

type Chunk = { pre: boolean; text: string }

/**
 * Collapse HTML whitespace the way the browser does for normal flow text,
 * while keeping exact characters inside `code` / `pre` / etc.
 */
function serializeVisible(root: HTMLElement): string {
  const chunks: Chunk[] = []

  const append = (pre: boolean, text: string) => {
    if (!text) return
    const last = chunks[chunks.length - 1]
    if (last && last.pre === pre) last.text += text
    else chunks.push({ pre, text })
  }

  /** Insert a collapsible boundary space outside preformatted content. */
  const softBoundary = () => {
    const last = chunks[chunks.length - 1]
    if (!last || last.pre) return
    if (!last.text || /\s$/.test(last.text)) return
    last.text += ' '
  }

  const walk = (node: Node, pre: boolean) => {
    if (node.nodeType === Node.TEXT_NODE) {
      append(pre, node.nodeValue || '')
      return
    }
    if (node.nodeType !== Node.ELEMENT_NODE) return

    const el = node as Element
    if (SKIP_TAGS.has(el.tagName) || isCaretEl(el)) return

    const nextPre = pre || isPreformatted(el)

    if (el.tagName === 'BR') {
      append(nextPre, '\n')
      return
    }

    const block = !nextPre && isBlockLike(el)
    if (block) softBoundary()

    for (let i = 0; i < el.childNodes.length; i++) {
      walk(el.childNodes[i]!, nextPre)
    }

    if (block) softBoundary()
  }

  walk(root, false)
  if (chunks.length === 0) return ''

  // Normalize non-pre chunks; keep pre/code exact
  const normalized: Chunk[] = chunks.map((chunk) =>
    chunk.pre ? chunk : { pre: false, text: chunk.text.replace(/\s+/g, ' ') }
  )

  // Drop leading / trailing empty-or-whitespace-only non-pre chunks
  let start = 0
  let end = normalized.length
  while (start < end && !normalized[start]!.pre && normalized[start]!.text.trim() === '') start++
  while (end > start && !normalized[end - 1]!.pre && normalized[end - 1]!.text.trim() === '') end--

  let out = ''
  for (let i = start; i < end; i++) {
    const chunk = normalized[i]!
    let text = chunk.text
    if (!chunk.pre) {
      if (i === start) text = text.replace(/^\s+/, '')
      if (i === end - 1) text = text.replace(/\s+$/, '')
    }
    out += text
  }

  // Strip caret / streaming control glyphs that are never content
  return out.replace(/[\u2009\u200B]/g, '')
}

/** Visible text of an element, ignoring the streaming caret. */
export function visibleText(el: HTMLElement | null | undefined): string {
  if (!el) return ''
  const clone = el.cloneNode(true) as HTMLElement
  return serializeVisible(clone)
}

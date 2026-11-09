export const RESET = '\x1B[0m'
export const BOLD = '\x1B[1m'
export const DIM = '\x1B[2m'
export const ITALIC = '\x1B[3m'
export const UNDERLINE = '\x1B[4m'
export const STRIKETHROUGH = '\x1B[9m'
export const CYAN = '\x1B[36m'
export const YELLOW = '\x1B[33m'
export const GREEN = '\x1B[32m'
export const BLUE = '\x1B[34m'
export const MAGENTA = '\x1B[35m'
export const RED = '\x1B[31m'

export function wrap(open: string, text: string, colors: boolean): string {
  if (!colors || !text) return text
  return open + text + RESET
}

/** CSI / OSC / other ANSI escape sequences (non-printing). */
// eslint-disable-next-line no-control-regex
const ANSI_RE = /\u001B(?:\[[\d;?]*[ -/]*[@-~]|\][^\u0007\u001B]*(?:\u0007|\u001B\\)?|[@-Z\\-_])/g

/** Remove ANSI escape sequences so length reflects visible terminal columns. */
export function stripAnsi(text: string): string {
  return text.replace(ANSI_RE, '')
}

// C0 controls except \t and \n, plus DEL and the C1 range. These bytes drive
// terminal control sequences (CSI/OSC/DCS), so author-controlled markdown
// must never pass them to the TTY.
// eslint-disable-next-line no-control-regex
const CONTROL_CHARS_RE = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g

/** Remove terminal control characters, keeping tab and newline. */
export function stripControlChars(text: string): string {
  return text.replace(CONTROL_CHARS_RE, '')
}

// Terminals draw East Asian Wide and Fullwidth characters (CJK, Hangul, kana,
// fullwidth forms) and emoji in two columns.
const WIDE_RE =
  /[\p{Emoji_Presentation}\u1100-\u115F\u2329\u232A\u2630-\u2637\u268A-\u268F\u2E80-\u303E\u3041-\u33FF\u3400-\u4DFF\u4E00-\u9FFF\uA000-\uA4CF\uA960-\uA97F\uAC00-\uD7A3\uF900-\uFAFF\uFE10-\uFE19\uFE30-\uFE6F\uFF00-\uFF60\uFFE0-\uFFE6\u{16FE0}-\u{18DFF}\u{1AFF0}-\u{1B2FF}\u{1D300}-\u{1D376}\u{1F200}-\u{1F265}\u{20000}-\u{3FFFD}]|\uFE0F/u
// Combining marks and invisible format characters take no column of their own.
const ZERO_WIDTH_RE = /^[\p{Mn}\p{Me}\u00AD\u200B-\u200F\u202A-\u202E\u2060-\u206F\uFEFF]*$/u
const PRINTABLE_ASCII_RE = /^[ -~]*$/

let segmenter: Intl.Segmenter | undefined

/** Terminal columns a string takes up, ignoring ANSI escape codes. */
export function visibleLength(text: string): number {
  const visible = stripAnsi(text)
  if (PRINTABLE_ASCII_RE.test(visible)) return visible.length

  segmenter ??= new Intl.Segmenter()
  let width = 0
  for (const { segment } of segmenter.segment(visible)) {
    if (WIDE_RE.test(segment)) width += 2
    else if (!ZERO_WIDTH_RE.test(segment)) width += 1
  }
  return width
}

/** Pad `text` with spaces on the right to a target *visible* width. */
export function padEndVisible(text: string, targetVisibleWidth: number): string {
  const pad = targetVisibleWidth - visibleLength(text)
  return pad > 0 ? text + ' '.repeat(pad) : text
}

/**
 * Choose a code fence for `content` that the content itself cannot close.
 *
 * A fence closes on any line with up to 3 leading spaces followed by a run of
 * the same fence character at least as long as the opening fence. Scan for
 * the longest such runs of both characters, then emit the character with the
 * shorter maximum run, one character longer than that run (minimum 3).
 */
export function pickFence(content: string): string {
  let maxBackticks = 0
  let maxTildes = 0
  for (const line of content.split('\n')) {
    const match = /^ {0,3}(`+|~+)/.exec(line)
    if (!match) continue
    const run = match[1]
    if (run[0] === '`') {
      if (run.length > maxBackticks) maxBackticks = run.length
    } else if (run.length > maxTildes) {
      maxTildes = run.length
    }
  }
  const char = maxBackticks <= maxTildes ? '`' : '~'
  return char.repeat(Math.max(3, (char === '`' ? maxBackticks : maxTildes) + 1))
}

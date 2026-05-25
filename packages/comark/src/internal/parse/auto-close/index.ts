/**
 * Auto-closes unclosed markdown and Comark component syntax
 * Useful for streaming/incremental parsing where content may be partial
 */

import { closeTables } from './table.ts'

/**
 * Linear-time auto-close implementation without regex
 * Processes markdown in O(n) time by scanning character-by-character
 *
 * @param markdown - The markdown content to auto-close
 * @returns The markdown with unclosed syntax closed
 */
export function autoCloseMarkdown(markdown: string): string {
  if (!markdown || markdown === '') return markdown

  const lines = markdown.split('\n')
  const n = lines.length

  // Single linear pass to collect document state
  let inFrontmatter = false
  let inBlockMath = false
  let tableStart = -1
  // Tag name when inside a raw-text HTML element (`<style>`, `<script>`,
  // `<pre>`, `<textarea>`). Their bodies must be passed through verbatim —
  // any `::root`/`**` markers there are CSS/JS/text, not Comark/markdown.
  let inRawTextElement: 'style' | 'script' | 'pre' | 'textarea' | null = null
  const RAW_TEXT_OPEN_RE = /^<(script|pre|style|textarea)(\s|>|$)/i

  const componentStack: Array<{
    depth: number
    name: string
    indent: string
    hasYamlProps: boolean
  }> = []

  for (let idx = 0; idx < n; idx++) {
    const line = lines[idx]
    const trimmed = line.trim()

    // Raw-text HTML element: skip all line-level processing inside its body,
    // and update the open/close state. Open and close can sit on the same
    // line (e.g. `<style>body { ... }</style>` inline).
    if (inRawTextElement) {
      const closeRe = new RegExp(`</${inRawTextElement}\\s*>`, 'i')
      if (closeRe.test(line)) inRawTextElement = null
      continue
    }
    const rawTextMatch = trimmed.match(RAW_TEXT_OPEN_RE)
    if (rawTextMatch) {
      const tag = rawTextMatch[1].toLowerCase() as 'style' | 'script' | 'pre' | 'textarea'
      // Stay "inside" only if the close tag isn't already on this line.
      const closeRe = new RegExp(`</${tag}\\s*>`, 'i')
      if (!closeRe.test(line)) inRawTextElement = tag
      continue
    }

    // Frontmatter: only starts at document line 0
    if (idx === 0 && trimmed === '---') {
      inFrontmatter = true
      continue
    }
    if (inFrontmatter) {
      if (trimmed === '---') inFrontmatter = false
      continue
    }

    // Block math delimiter on its own line
    if (trimmed === '$$') {
      inBlockMath = !inBlockMath
      continue
    }

    // YAML props fence inside a component
    if (trimmed === '---' && componentStack.length > 0) {
      componentStack[componentStack.length - 1].hasYamlProps = !componentStack[componentStack.length - 1].hasYamlProps
      continue
    }

    // Table block tracking (consecutive pipe-starting lines)
    if (trimmed.startsWith('|')) {
      tableStart = tableStart === -1 ? idx : tableStart
    } else if (tableStart !== -1) {
      tableStart = -1
    }

    // Clear the line if there is no open component and the last line is a component fence without name
    if (idx === n - 1) {
      if (trimmed[0] === ':' && componentStack.length === 0) {
        let colonCount = 0
        while (colonCount < trimmed.length && trimmed[colonCount] === ':') colonCount++
        if (trimmed.slice(colonCount).trim() === '') {
          lines[idx] = ''
        }
      }
    }

    // Component open/close (lines starting with :: or more colons)
    if (trimmed[0] === ':') {
      let colonCount = 0
      while (colonCount < trimmed.length && trimmed[colonCount] === ':') colonCount++
      if (colonCount >= 2) {
        let indentEnd = 0
        while (indentEnd < line.length && (line[indentEnd] === ' ' || line[indentEnd] === '\t')) indentEnd++
        const indent = line.slice(0, indentEnd)
        const ch = trimmed[colonCount] ?? ''
        const isName = (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '$'

        if (isName) {
          let nameEnd = colonCount
          while (nameEnd < trimmed.length) {
            const c = trimmed[nameEnd]
            if (
              !(
                (c >= 'a' && c <= 'z') ||
                (c >= 'A' && c <= 'Z') ||
                (c >= '0' && c <= '9') ||
                c === '$' ||
                c === '.' ||
                c === '-' ||
                c === '_'
              )
            )
              break
            nameEnd++
          }
          componentStack.push({
            depth: colonCount,
            name: trimmed.slice(colonCount, nameEnd),
            indent,
            hasYamlProps: false,
          })
        } else if (colonCount === trimmed.length && componentStack.length > 0) {
          const top = componentStack[componentStack.length - 1]
          if (top.depth === colonCount) componentStack.pop()
        }
      }
    }
  }

  // Fix inline markers on last line (skip inside block-level structures)
  const lastIdx = n - 1
  if (!inFrontmatter && !inBlockMath && lines[lastIdx].trim() !== '$$') {
    lines[lastIdx] = closeInlineMarkersLinear(lines[lastIdx])
  }

  let result = lines.join('\n')

  // Fix tables
  if (tableStart !== -1) {
    result = closeTables(result)
  }

  // Close unclosed frontmatter
  if (inFrontmatter) {
    const lastTrimmed = lines[lastIdx].trim()
    if (lastTrimmed === '-' || lastTrimmed === '--') {
      result += '-'.repeat(3 - lastTrimmed.length)
    } else {
      result += result.endsWith('\n') ? '---' : '\n---'
    }
  }

  // Close unclosed block math
  if (inBlockMath) {
    result += result.endsWith('\n') ? '$$' : '\n$$'
  }

  // Close Comark components
  if (markdown.includes('::')) {
    // Close unclosed brace in last line props
    const lastLineStart = result.lastIndexOf('\n') + 1
    const finalLine = result.slice(lastLineStart)
    let lastOpenBrace = -1
    for (let i = finalLine.length - 1; i >= 0; i--) {
      if (finalLine[i] === '}') break
      if (finalLine[i] === '{') {
        lastOpenBrace = i
        break
      }
    }
    if (lastOpenBrace >= 0) {
      const propsContent = finalLine.slice(lastOpenBrace + 1)
      let dq = 0
      let sq = 0
      for (let i = 0; i < propsContent.length; i++) {
        if (propsContent[i] === '"') dq++
        if (propsContent[i] === "'") sq++
      }
      let braceClose = ''
      if (dq % 2 === 1) braceClose += '"'
      if (sq % 2 === 1) braceClose += "'"
      result += braceClose + '}'
    }

    if (componentStack.length > 0) {
      // Complete partial YAML fence (- or --) in top component's props
      const topComp = componentStack[componentStack.length - 1]
      const newLastStart = result.lastIndexOf('\n') + 1
      const newFinalTrimmed = result.slice(newLastStart).trim()
      if (topComp.hasYamlProps && (newFinalTrimmed === '-' || newFinalTrimmed === '--')) {
        result += '-'.repeat(3 - newFinalTrimmed.length)
        topComp.hasYamlProps = false
      }

      // Append component closers
      const compClosers: string[] = []
      while (componentStack.length > 0) {
        const comp = componentStack.pop()!
        if (comp.hasYamlProps) compClosers.push(comp.indent + '---')
        compClosers.push(comp.indent + ':'.repeat(comp.depth))
      }
      result += '\n' + compClosers.join('\n')
    }
  }

  return result
}

/**
 * Closes inline markers (`*`, `_`, `~`, `` ` ``, `$`, `[` / `(`) on the last
 * line of streaming markdown.
 *
 * Algorithm (per marker type, independent stacks):
 *   1. Scan the line once, skipping characters inside `{...}` attribute scopes
 *      and link `[text](url)` payloads, and collecting runs of each marker.
 *   2. Match runs left-to-right with CommonMark flanking rules:
 *        - left-flanking (opener): not followed by whitespace
 *        - right-flanking (closer): not preceded by whitespace
 *        - underscore: also disqualified when both neighbours are word chars
 *   3. Any opener still on the stack at end-of-line needs a closer.
 *
 * The first marker type to need closing wins (priority: `*`, `_`, `~`, `` ` ``,
 * `$`, `]`, `)`), matching the previous one-suffix behaviour.
 */
function closeInlineMarkersLinear(line: string): string {
  const len = line.length
  if (len === 0) return line

  let contentEnd = len
  while (contentEnd > 0 && (line[contentEnd - 1] === ' ' || line[contentEnd - 1] === '\t')) {
    contentEnd--
  }
  const hasTrailingSpace = contentEnd < len

  // Scan once, collect marker runs (skipping attribute & link scopes) and
  // track unmatched bracket / paren counts for link auto-close.
  const asteriskRuns: Run[] = []
  const underscoreRuns: Run[] = []
  const tildeRuns: Run[] = []
  const backtickRuns: Run[] = []
  const dollarRuns: Run[] = []
  let bracketBalance = 0
  let parenBalance = 0
  {
    let attrDepth = 0
    let inLinkText = 0
    let inLinkUrl = 0
    let lastBracketPos = -1
    let i = 0
    while (i < len) {
      const ch = line[i]
      const prevCh = i > 0 ? line[i - 1] : ''

      // {…} attribute scope swallows everything inside.
      if (ch === '{' && prevCh !== ' ') {
        attrDepth++
        i++
        continue
      }
      if (ch === '}') {
        if (attrDepth > 0) attrDepth--
        i++
        continue
      }
      if (attrDepth > 0) {
        i++
        continue
      }

      // Link brackets/parens: track balance for auto-close, swallow their interior.
      if (ch === '[') {
        bracketBalance++
        lastBracketPos = i
        inLinkText++
        i++
        continue
      }
      if (ch === ']') {
        bracketBalance--
        lastBracketPos = i
        if (inLinkText > 0) inLinkText--
        i++
        continue
      }
      if (ch === '(') {
        if (lastBracketPos >= 0 && i > lastBracketPos) {
          parenBalance++
          if (prevCh === ']') inLinkUrl++
        }
        i++
        continue
      }
      if (ch === ')') {
        if (lastBracketPos >= 0 && i > lastBracketPos) {
          parenBalance--
          if (inLinkUrl > 0) inLinkUrl--
        }
        i++
        continue
      }
      if (inLinkText > 0 || inLinkUrl > 0) {
        i++
        continue
      }

      // Marker runs.
      if (ch === '*' || ch === '_' || ch === '~' || ch === '`' || ch === '$') {
        const start = i
        while (i < len && line[i] === ch) i++
        const bucket =
          ch === '*'
            ? asteriskRuns
            : ch === '_'
              ? underscoreRuns
              : ch === '~'
                ? tildeRuns
                : ch === '`'
                  ? backtickRuns
                  : dollarRuns
        bucket.push({ start, end: i })
        continue
      }

      i++
    }
  }

  let closingSuffix = ''
  let shouldTrim = false

  // Flanking-aware emphasis stack — used for `*`, `_`, `~`.
  const emphasisSuffix = (marker: '*' | '_' | '~', runs: Run[]): string => {
    if (runs.length === 0) return ''
    const stack: number[] = []
    for (const r of runs) {
      const prevCh = r.start > 0 ? line[r.start - 1] : ''
      const afterCh = r.end < len ? line[r.end] : ''
      const prevWs = prevCh === '' || prevCh === ' ' || prevCh === '\t'
      const afterWs = afterCh === '' || afterCh === ' ' || afterCh === '\t'
      let canOpen = !afterWs
      let canClose = !prevWs
      if (marker === '_' && isWordChar(prevCh) && isWordChar(afterCh)) {
        canOpen = false
        canClose = false
      }
      let remaining = r.end - r.start
      while (canClose && remaining > 0 && stack.length > 0) {
        const top = stack.length - 1
        const consume = Math.min(stack[top], remaining)
        stack[top] -= consume
        remaining -= consume
        if (stack[top] === 0) stack.pop()
      }
      if (canOpen && remaining > 0) stack.push(remaining)
    }
    return stack.length === 0 ? '' : stack.map((n) => marker.repeat(n)).join('')
  }

  // Asterisk emphasis (`*`, `**`, `***`).
  const aSuffix = emphasisSuffix('*', asteriskRuns)
  if (aSuffix) {
    closingSuffix = aSuffix
    if (hasTrailingSpace) shouldTrim = true
  }

  // Underscore emphasis (`_`, `__`, `___`).
  if (!closingSuffix) {
    const uSuffix = emphasisSuffix('_', underscoreRuns)
    if (uSuffix) {
      closingSuffix = uSuffix
      if (hasTrailingSpace) shouldTrim = true
    }
  }

  // Tildes — single `~` and GFM `~~` use the same flanking rules.
  if (!closingSuffix) {
    const tSuffix = emphasisSuffix('~', tildeRuns)
    if (tSuffix) {
      closingSuffix = tSuffix
      if (hasTrailingSpace) shouldTrim = true
    }
  }

  // Backticks — code spans match by exact run length, with no flanking rules.
  // Don't trim trailing whitespace inside a code span.
  if (!closingSuffix && backtickRuns.length > 0) {
    const stack: number[] = []
    for (const r of backtickRuns) {
      const myLen = r.end - r.start
      const matchIdx = stack.lastIndexOf(myLen)
      if (matchIdx >= 0) stack.splice(matchIdx, 1)
      else stack.push(myLen)
    }
    if (stack.length > 0) {
      // Close the most recent unmatched opener (markdown-it picks the same).
      closingSuffix = '`'.repeat(stack[stack.length - 1])
    }
  }

  // Dollars — `$$` for block math, `$` for inline. Length-exact matching.
  // Standalone `$$` on its own line is a block-math delimiter; the caller
  // skips us in that case, so we don't need to special-case it here.
  if (!closingSuffix && dollarRuns.length > 0) {
    const stack: number[] = []
    for (const r of dollarRuns) {
      const myLen = r.end - r.start
      const matchIdx = stack.lastIndexOf(myLen)
      if (matchIdx >= 0) stack.splice(matchIdx, 1)
      else stack.push(myLen)
    }
    if (stack.length > 0) {
      closingSuffix = '$'.repeat(stack[stack.length - 1])
    }
  }

  if (!closingSuffix && bracketBalance > 0) closingSuffix = ']'
  if (!closingSuffix && parenBalance > 0) closingSuffix = ')'

  if (shouldTrim && closingSuffix) {
    return line.slice(0, contentEnd) + closingSuffix
  }
  return line + closingSuffix
}

interface Run {
  start: number
  end: number
}

function isWordChar(ch: string): boolean {
  return (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || (ch >= '0' && ch <= '9')
}

/**
 * Auto-closes unclosed markdown and Comark component syntax
 * Useful for streaming/incremental parsing where content may be partial
 */

import { closeTables } from './table'

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

  const componentStack: Array<{
    depth: number
    name: string
    indent: string
    hasYamlProps: boolean
  }> = []

  for (let idx = 0; idx < n; idx++) {
    const line = lines[idx]
    const trimmed = line.trim()

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
    }
    else if (tableStart !== -1) {
      tableStart = -1
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
            if (!((c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || (c >= '0' && c <= '9') || c === '$' || c === '.' || c === '-' || c === '_')) break
            nameEnd++
          }
          componentStack.push({ depth: colonCount, name: trimmed.slice(colonCount, nameEnd), indent, hasYamlProps: false })
        }
        else if (colonCount === trimmed.length && componentStack.length > 0) {
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
    }
    else {
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
      if (finalLine[i] === '{') { lastOpenBrace = i; break }
    }
    if (lastOpenBrace >= 0) {
      const propsContent = finalLine.slice(lastOpenBrace + 1)
      let dq = 0
      let sq = 0
      for (let i = 0; i < propsContent.length; i++) {
        if (propsContent[i] === '"') dq++
        if (propsContent[i] === '\'') sq++
      }
      let braceClose = ''
      if (dq % 2 === 1) braceClose += '"'
      if (sq % 2 === 1) braceClose += '\''
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
 * Closes inline markers (*, **, ***, ~~, `, $, $$, [, () on the last line
 * without using regex - pure character scanning in O(n) time
 */
function closeInlineMarkersLinear(line: string): string {
  const len = line.length
  if (len === 0) return line

  // Count markers by scanning
  let asteriskCount = 0
  let underscoreCount = 0
  let tildeCount = 0 // Count individual tildes
  let backtickCount = 0
  let dollarCount = 0 // Count $ for math
  let dollarPairCount = 0 // Count $$ pairs for block math
  let bracketBalance = 0 // [ minus ]
  let parenBalance = 0 // ( minus ) after last ]
  let lastBracketPos = -1

  // Track trailing whitespace
  let contentEnd = len
  while (contentEnd > 0 && (line[contentEnd - 1] === ' ' || line[contentEnd - 1] === '\t')) {
    contentEnd--
  }
  const hasTrailingSpace = contentEnd < len

  // Track ** positions for O(n) complete pair detection (avoids O(n^3) nested loops)
  const doubleAsteriskPositions: number[] = []
  const doubleUnderscorePositions: number[] = []

  // Single-pass scan through the line - O(n)
  for (let i = 0; i < len; i++) {
    const ch = line[i]

    if (ch === '*') {
      asteriskCount++
      // Track ** positions (not part of ***)
      if (i + 1 < len && line[i + 1] === '*') {
        const isPartOfTriple = (i > 0 && line[i - 1] === '*') || (i + 2 < len && line[i + 2] === '*')
        if (!isPartOfTriple) {
          doubleAsteriskPositions.push(i)
        }
      }
    }
    else if (ch === '_') {
      underscoreCount++
      // Track __ positions (for bold)
      if (i + 1 < len && line[i + 1] === '_') {
        doubleUnderscorePositions.push(i)
      }
    }
    else if (ch === '~') {
      tildeCount++
    }
    else if (ch === '`') {
      backtickCount++
    }
    else if (ch === '$') {
      // Count $$ pairs for block/display math
      if (i + 1 < len && line[i + 1] === '$') {
        dollarPairCount++
        dollarCount += 2 // Count both dollars in the pair
        i++ // Skip next $ since we counted the pair
      }
      else {
        dollarCount++ // Single $ for inline math
      }
    }
    else if (ch === '[') {
      bracketBalance++
      lastBracketPos = i
    }
    else if (ch === ']') {
      bracketBalance--
      lastBracketPos = i
    }
    else if (ch === '(') {
      if (lastBracketPos >= 0 && i > lastBracketPos) {
        parenBalance++
      }
    }
    else if (ch === ')') {
      if (lastBracketPos >= 0 && i > lastBracketPos) {
        parenBalance--
      }
    }
  }

  // Check for complete ** pairs in O(1) - pairs are matched left to right
  const hasCompleteBoldPair = doubleAsteriskPositions.length >= 2

  let closingSuffix = ''
  let shouldTrim = false

  // Check for unclosed markers in priority order

  // Check *** (bold+italic)
  // Only treat as *** if line actually starts with *** (not just has 3 asterisks total)
  if (asteriskCount >= 3 && line[0] === '*' && line[1] === '*' && line[2] === '*') {
    const remainder = asteriskCount % 6
    if (remainder === 3) {
      // Check if line starts with more than 3 asterisks (e.g., ****)
      if (!(line[3] === '*')) {
        // Check if marker at end with no content
        if (!(contentEnd >= 3 && line[contentEnd - 1] === '*' && line[contentEnd - 2] === '*'
          && line[contentEnd - 3] === '*' && (contentEnd === 3 || line[contentEnd - 4] === ' '))) {
          closingSuffix = '***'
        }
      }
    }
    else if (remainder > 3 && remainder < 6) {
      const needed = 6 - remainder
      closingSuffix = '*'.repeat(needed)
    }
  }

  // Check ** (bold) if not already closing
  if (!closingSuffix && asteriskCount >= 2) {
    const remainder = asteriskCount % 4
    if (remainder === 2) {
      // Only check for ** if there are actually ** markers in the line
      // This prevents "*italic*" (2 asterisks) from being treated as unclosed **
      if (doubleAsteriskPositions.length > 0) {
        // Check if line starts with more asterisks than ** (e.g., *** or more)
        // This prevents "***text***" or "***text** *more" from being seen as unclosed **
        const startsWithMoreAsterisks = line[0] === '*' && line[1] === '*' && line[2] === '*'

        if (!startsWithMoreAsterisks) {
          // Check if marker at end with no content
          const endsWithMarker = contentEnd >= 2 && line[contentEnd - 1] === '*' && line[contentEnd - 2] === '*'
          const markerAtEnd = endsWithMarker && (contentEnd === 2 || line[contentEnd - 3] === ' ')

          if (!markerAtEnd) {
            // Check if all asterisks are paired (bold + italic complete)
            // If we have complete ** pairs, check remaining asterisks for italic
            const boldAsterisksUsed = Math.floor(doubleAsteriskPositions.length / 2) * 4
            const remainingSingle = asteriskCount - boldAsterisksUsed
            const allPaired = hasCompleteBoldPair && remainingSingle % 2 === 0

            if (!allPaired) {
              // Check if line ends with word (not just a closing marker)
              const lastChar = line[contentEnd - 1]
              const endsWithWord = (lastChar >= 'a' && lastChar <= 'z')
                || (lastChar >= 'A' && lastChar <= 'Z')
                || (lastChar >= '0' && lastChar <= '9')

              if (!hasCompleteBoldPair || endsWithWord) {
                closingSuffix = '**'
                if (hasTrailingSpace && !endsWithMarker) {
                  shouldTrim = true
                }
              }
            }
          }
        }
      }
    }
    else if (remainder > 2 && remainder < 4) {
      const needed = 4 - remainder
      closingSuffix = '*'.repeat(needed)
    }
  }

  // Check * (italic) if not already closing
  if (!closingSuffix && asteriskCount % 2 === 1) {
    // Check if line starts with more asterisks (e.g., ** or ***)
    // But allow italic closing if bold pairs are complete
    const startsWithMoreAsterisks = line[0] === '*' && line[1] === '*'

    if (!startsWithMoreAsterisks || hasCompleteBoldPair) {
      // Check if * followed by space (invalid italic)
      let validItalic = false
      for (let i = 0; i < len; i++) {
        if (line[i] === '*') {
          const nextCh = i + 1 < len ? line[i + 1] : ''
          const prevCh = i > 0 ? line[i - 1] : ''
          // Valid if not followed by space, or if it's preceded by space (closing)
          if (nextCh !== ' ' || prevCh === ' ') {
            validItalic = true
            break
          }
        }
      }

      if (validItalic) {
        // Check marker at end with no content
        // Only skip if it's truly isolated (e.g., "input *")
        // Don't skip if there are complete pairs before it (e.g., "input **bold** *")
        const markerAtEnd = contentEnd >= 1 && line[contentEnd - 1] === '*'
          && (contentEnd === 1 || line[contentEnd - 2] === ' ')

        if (!markerAtEnd || asteriskCount > 1) {
          closingSuffix = '*'
          const endsWithMarker = line[contentEnd - 1] === '*'
          if (hasTrailingSpace && !endsWithMarker) {
            shouldTrim = true
          }
        }
      }
    }
  }

  // Check __ (double underscore bold)
  if (!closingSuffix && underscoreCount >= 2) {
    const remainder = underscoreCount % 4
    if (remainder === 2) {
      // Only check for __ if there are actually __ markers in the line
      if (doubleUnderscorePositions.length > 0) {
        const hasCompleteUnderscorePair = doubleUnderscorePositions.length >= 2

        // Check if marker at end with no content
        const endsWithMarker = contentEnd >= 2 && line[contentEnd - 1] === '_' && line[contentEnd - 2] === '_'
        const markerAtEnd = endsWithMarker && (contentEnd === 2 || line[contentEnd - 3] === ' ')

        if (!markerAtEnd && !hasCompleteUnderscorePair) {
          closingSuffix = '__'
          if (hasTrailingSpace && !endsWithMarker) {
            shouldTrim = true
          }
        }
      }
    }
    else if (remainder > 2 && remainder < 4) {
      const needed = 4 - remainder
      closingSuffix = '_'.repeat(needed)
    }
  }

  // Check _ (underscore italic)
  if (!closingSuffix && underscoreCount % 2 === 1) {
    // Check if _ followed by space (invalid italic)
    let validItalic = false
    for (let i = 0; i < len; i++) {
      if (line[i] === '_') {
        const nextCh = i + 1 < len ? line[i + 1] : ''
        const prevCh = i > 0 ? line[i - 1] : ''
        // Valid if not followed by space, or if it's preceded by space (closing)
        if (nextCh !== ' ' || prevCh === ' ') {
          validItalic = true
          break
        }
      }
    }

    if (validItalic) {
      // Check marker at end with no content
      const markerAtEnd = contentEnd >= 1 && line[contentEnd - 1] === '_'
        && (contentEnd === 1 || line[contentEnd - 2] === ' ')

      if (!markerAtEnd) {
        closingSuffix = '_'
        const endsWithMarker = line[contentEnd - 1] === '_'
        if (hasTrailingSpace && !endsWithMarker) {
          shouldTrim = true
        }
      }
    }
  }

  // Check ~~ (strikethrough)
  if (!closingSuffix && tildeCount >= 2) {
    const remainder = tildeCount % 4
    if (remainder === 2) {
      // Two tildes unclosed, close with ~~
      closingSuffix = '~~'
      if (hasTrailingSpace) shouldTrim = true
    }
    else if (remainder > 2 && remainder < 4) {
      // Partial marker like ~~text~ (3 tildes), need 1 more
      const needed = 4 - remainder
      closingSuffix = '~'.repeat(needed)
      if (hasTrailingSpace) shouldTrim = true
    }
  }

  // Check ` (code)
  if (!closingSuffix && backtickCount % 2 === 1) {
    closingSuffix = '`'
  }

  // Check $$ (block math) - takes priority over single $
  // Don't close if the line is just $$ (block math delimiter on its own line)
  if (!closingSuffix && dollarPairCount % 2 === 1) {
    const trimmedLine = line.trim()
    // Only close if this isn't a standalone $$ (which would be a block math delimiter)
    if (trimmedLine !== '$$') {
      closingSuffix = '$$'
    }
  }

  // Check $ (inline math)
  if (!closingSuffix && dollarCount % 2 === 1) {
    closingSuffix = '$'
  }

  // Check [ ] (brackets)
  if (!closingSuffix && bracketBalance > 0) {
    closingSuffix = ']'
  }

  // Check ( ) (parens)
  if (!closingSuffix && parenBalance > 0) {
    closingSuffix = ')'
  }

  // Apply closing
  if (shouldTrim && closingSuffix) {
    let trimmedLen = len
    while (trimmedLen > 0 && (line[trimmedLen - 1] === ' ' || line[trimmedLen - 1] === '\t')) {
      trimmedLen--
    }
    return line.slice(0, trimmedLen) + closingSuffix
  }

  return line + closingSuffix
}

import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'
import { textContent } from '../../../utils/index.ts'
import { comarkAttributes, userBlockAttrs } from '../attributes.ts'

export function pre(node: ComarkElement, state: State) {
  const [_, attributes, ...children] = node

  const codeClasses = (children[0]?.[1] as Record<string, string>)?.class

  const language =
    attributes.language ||
    codeClasses
      ?.split(' ')
      .find((cls) => cls.startsWith('language-'))
      ?.slice(9) ||
    ''

  // Escape ] in filename
  const filename = attributes.filename ? ' [' + String(attributes.filename).split(']').join('\\\\]') + ']' : ''

  const highlights = attributes.highlights ? ' {' + formatHighlights(attributes.highlights as number[]) + '}' : ''

  // Meta always has a leading space
  const meta = attributes.meta ? ' ' + attributes.meta : ''

  const code = String(node[1]?.code || textContent(node)).trim()
  const fence = code.includes('```') ? '~~~' : '```'

  const fenceBlock = fence + language + filename + highlights + meta + '\n' + code + '\n' + fence
  // Extra user attrs that can't ride on the fence info string round-trip via
  // `::pre{attrs}\n```…```\n::` — mirrors the wrapper form for ul/ol/table/blockquote.
  const attrs = comarkAttributes(userBlockAttrs('pre', attributes as Record<string, unknown>))
  if (attrs) {
    return `::pre${attrs}\n${fenceBlock}\n::` + state.context.blockSeparator
  }

  return fenceBlock + state.context.blockSeparator
}

function formatHighlights(highlights: number[]): string {
  if (highlights.length === 0) return ''

  const sorted = [...highlights].sort((a, b) => a - b)
  const ranges: string[] = []
  let start = sorted[0]
  let end = sorted[0]

  for (let i = 1; i <= sorted.length; i++) {
    if (i < sorted.length && sorted[i] === end + 1) {
      end = sorted[i]
    } else {
      // Add the current range
      if (start === end) {
        ranges.push(String(start))
      } else {
        ranges.push(start + '-' + end)
      }
      // Start a new range
      if (i < sorted.length) {
        start = sorted[i]
        end = sorted[i]
      }
    }
  }

  return ranges.join(',')
}

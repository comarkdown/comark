import { kebabCase } from '../../../utils/index.ts'
import { parseBracketContent } from './brackets.ts'
import { searchProps } from './props.ts'

const RE_BLOCK_NAME = /^[a-z$][$\w.-]*/i

/**
 * Parse `component-name [content] {.params}` from the trailing portion of a block fence line.
 */
export function parseBlockParams(str: string, captureRanges = false) {
  str = str.trim()
  if (!str) return { name: '' }
  const name = str.match(RE_BLOCK_NAME)?.[0]
  if (!name) throw new Error(`Invalid block params: ${str}`)

  let remaining = str.slice(name.length).trim()
  let content: string | undefined
  let props: [string, string][] | undefined
  let unparsedRemaining: string | undefined
  let sourceRanges: { name: string; start?: number; end?: number }[] | undefined

  if (remaining.startsWith('[')) {
    const result = parseBracketContent(remaining, 0)
    if (result) {
      content = result.content
      remaining = remaining.slice(result.endIndex).trim()
    }
  }

  if (remaining.startsWith('{')) {
    const propsResult = searchProps(remaining, 0, captureRanges)
    if (propsResult) {
      props = propsResult.props
      if (captureRanges) {
        const offset = str.length - remaining.length
        sourceRanges = propsResult.ranges?.map((range) => ({
          ...range,
          start: range.start === undefined ? undefined : range.start + offset,
          end: range.end === undefined ? undefined : range.end + offset,
        }))
      }
      const afterProps = remaining.slice(propsResult.index).trim()
      if (afterProps) unparsedRemaining = afterProps
    }
  } else if (remaining) {
    unparsedRemaining = remaining
  }

  const result: {
    name: string
    content?: string
    props?: [string, string][]
    remaining?: string
    sourceRanges?: typeof sourceRanges
  } = {
    name: kebabCase(name),
  }

  if (captureRanges) result.sourceRanges = sourceRanges
  if (content !== undefined) result.content = content
  if (props !== undefined) result.props = props
  if (unparsedRemaining) result.remaining = unparsedRemaining

  return result
}

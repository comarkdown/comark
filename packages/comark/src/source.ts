import { createMarkdownParser, parseFrontmatter } from './parse.ts'
import { sourceRangesPlugin } from './internal/source-ranges.ts'

/** Half-open UTF-16 offsets into the original source, excluding surrounding quotes. */
export interface SourceRange {
  start: number
  end: number
}

export interface SourceAttribute {
  name: string
  /** Absent when the attribute has no authored value, such as a boolean shorthand. */
  range?: SourceRange
}

/** Attributes sharing one authored element; duplicate and bound names remain in source order. */
export interface SourceElement {
  tag: string
  attributes: SourceAttribute[]
}

/**
 * Locate inline Markdown destinations and component attributes with the default CoMark grammar.
 * Reference definitions, YAML props, raw HTML attributes, and transformed source are omitted.
 * Streaming repair is disabled. The returned ranges are separate from the renderable tree.
 */
export function createMarkdownSourceParser(): (source: string) => Promise<SourceElement[]> {
  const parse = createMarkdownParser({ autoClose: false, plugins: [sourceRangesPlugin()] })

  return async (source) => {
    const { content } = parseFrontmatter(source)
    const offset = source.length - content.length
    const positions: number[] = []
    for (let i = 0; i < content.length; i++) {
      positions.push(offset + i)
      if (content[i] === '\r' && content[i + 1] === '\n') i++
    }
    positions.push(source.length)

    const document = await parse(source)
    if (document.meta.sourceText !== content.replace(/\r\n?/g, '\n').replace(/\0/g, '\uFFFD')) {
      throw new Error('Source ranges require untransformed Markdown.')
    }
    return document.meta.sourceElements.map((element) => ({
      ...element,
      attributes: element.attributes.map((attribute) => ({
        ...attribute,
        range: attribute.range && { start: positions[attribute.range.start], end: positions[attribute.range.end] },
      })),
    }))
  }
}

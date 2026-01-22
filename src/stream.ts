import type { Readable } from 'node:stream'
import type { MDCRoot } from './types/tree'
import MarkdownIt from 'markdown-it'
import pluginMdc from 'markdown-it-mdc'
import { parseFrontMatter } from 'remark-mdc'
import { autoCloseMarkdown } from './auto-close'
import { convertMarkdownItTokensToMDC } from './utils/parse'
import { generateToc } from './utils/table-of-contents'

export interface ParseResult {
  body: MDCRoot
  excerpt?: MDCRoot
  data: any
  toc?: any
}

export interface IncrementalParseResult {
  chunk: string // The chunk that was just processed
  body: MDCRoot // Current state of the parsed body
  data: any // Frontmatter data (available once parsed)
  isComplete: boolean // Whether the stream is complete
  excerpt?: MDCRoot // Optional excerpt
  toc?: any // Table of contents (available when complete)
}

/**
 * Helper function to convert a stream to string
 */
async function streamToString(stream: Readable | ReadableStream<Uint8Array>): Promise<string> {
  // Check if it's a Node.js Readable stream by checking for the Symbol.asyncIterator
  if (Symbol.asyncIterator in stream) {
    // Node.js stream
    const chunks: Uint8Array[] = []
    const nodeStream = stream as Readable

    for await (const chunk of nodeStream) {
      // Handle both Buffer and Uint8Array chunks
      if (chunk instanceof Uint8Array) {
        chunks.push(chunk)
      }
      else if (typeof chunk === 'string') {
        chunks.push(new TextEncoder().encode(chunk))
      }
      else {
        // Assume it's array-like
        chunks.push(new Uint8Array(chunk))
      }
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0

    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    return new TextDecoder('utf-8').decode(result)
  }
  else {
    // Web stream
    const webStream = stream as ReadableStream<Uint8Array>
    const reader = webStream.getReader()
    const chunks: Uint8Array[] = []

    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break
        chunks.push(value)
      }
    }
    finally {
      reader.releaseLock()
    }

    const totalLength = chunks.reduce((acc, chunk) => acc + chunk.length, 0)
    const result = new Uint8Array(totalLength)
    let offset = 0

    for (const chunk of chunks) {
      result.set(chunk, offset)
      offset += chunk.length
    }

    return new TextDecoder('utf-8').decode(result)
  }
}

/**
 * Internal parse function
 */
function parseContent(source: string): ParseResult {
  const { content, data } = parseFrontMatter(source)
  // Enable tables, GFM features
  const markdownIt = new MarkdownIt({
    html: true,
    linkify: true,
  })
    .enable(['table'])
    .use(pluginMdc)
  const tokens = markdownIt.parse(content, {})

  // Convert tokens to MDC structure
  const children = convertMarkdownItTokensToMDC(tokens)

  // Filter out top-level text nodes
  const filteredChildren = children.filter(child => child.type !== 'text')

  const body: MDCRoot = {
    type: 'root',
    children: filteredChildren,
  }

  // Handle excerpt (look for HTML comment with 'more')
  let excerpt: MDCRoot | undefined
  const excerptIndex = tokens.findIndex(
    (token: any) => token.type === 'html_block' && token.content?.includes('<!-- more -->'),
  )

  if (excerptIndex !== -1) {
    const excerptTokens = tokens.slice(0, excerptIndex)
    const excerptChildren = convertMarkdownItTokensToMDC(excerptTokens, new Set())
    excerpt = {
      type: 'root',
      children: excerptChildren.filter(child => child.type !== 'text'),
    }

    // Include styles if excerpt contains code block
    if (excerpt.children.find(node => node.type === 'element' && node.tag === 'pre')) {
      const lastChild = body.children[body.children.length - 1]
      if (lastChild && lastChild.type === 'element' && lastChild.tag === 'style') {
        excerpt.children.push(lastChild)
      }
    }
  }

  const toc = generateToc(body, {
    title: data.title || '',
    depth: data.depth || 2,
    searchDepth: data.searchDepth || 2,
    links: [],
  })

  return {
    body,
    excerpt,
    data,
    toc,
  }
}

/**
 * Parse MDC content from a Node.js Readable stream or Web ReadableStream
 *
 * @param stream - A Node.js Readable stream or Web ReadableStream containing MDC content
 * @returns Promise resolving to the parsed MDC structure
 *
 * @example
 * ```typescript
 * import { createReadStream } from 'fs'
 * import { parseStream } from 'mdc-syntax/stream'
 *
 * const stream = createReadStream('content.md')
 * const result = await parseStream(stream)
 * console.log(result.body)
 * ```
 */
export async function parseStream(stream: Readable | ReadableStream<Uint8Array>): Promise<ParseResult> {
  const content = await streamToString(stream)
  return parseContent(content)
}

/**
 * Parse MDC content incrementally from a stream,
 * yielding results as each chunk is received
 *
 * @param stream - A Node.js Readable stream or Web ReadableStream containing MDC content
 * @yields IncrementalParseResult for each chunk received
 *
 * @example
 * ```typescript
 * import { createReadStream } from 'fs'
 * import { parseStreamIncremental } from 'mdc-syntax/stream'
 *
 * const stream = createReadStream('content.md')
 * for await (const result of parseStreamIncremental(stream)) {
 *   console.log('Chunk:', result.chunk)
 *   console.log('Current body:', result.body)
 *   console.log('Complete:', result.isComplete)
 * }
 * ```
 */
export async function* parseStreamIncremental(
  stream: Readable | ReadableStream<Uint8Array>,
): AsyncGenerator<IncrementalParseResult, void, unknown> {
  let accumulatedContent = ''
  let frontmatterParsed = false
  let frontmatterData: any = {}

  if (Symbol.asyncIterator in stream) {
    // Node.js stream
    const nodeStream = stream as Readable

    for await (const rawChunk of nodeStream) {
      // Convert chunk to string
      let chunkStr: string
      if (rawChunk instanceof Uint8Array) {
        chunkStr = new TextDecoder('utf-8').decode(rawChunk)
      }
      else if (typeof rawChunk === 'string') {
        chunkStr = rawChunk
      }
      else {
        chunkStr = new TextDecoder('utf-8').decode(new Uint8Array(rawChunk))
      }

      accumulatedContent += chunkStr

      // Parse frontmatter if not already done
      if (!frontmatterParsed) {
        const { data } = parseFrontMatter(accumulatedContent)
        frontmatterData = data
        frontmatterParsed = true
      }

      // Auto-close unclosed syntax before parsing intermediate results
      const closedContent = autoCloseMarkdown(accumulatedContent)

      // Parse the auto-closed content
      const result = parseContent(closedContent)

      yield {
        chunk: chunkStr,
        body: result.body,
        data: frontmatterData,
        isComplete: false,
        excerpt: result.excerpt,
      }
    }

    // Final parse with complete content (no auto-close needed, content is complete)
    const finalResult = parseContent(accumulatedContent)
    yield {
      chunk: '',
      body: finalResult.body,
      data: finalResult.data,
      isComplete: true,
      excerpt: finalResult.excerpt,
      toc: finalResult.toc,
    }
  }
  else {
    // Web stream
    const webStream = stream as ReadableStream<Uint8Array>
    const reader = webStream.getReader()

    try {
      while (true) {
        const { done, value } = await reader.read()

        if (done) {
          // Final parse with complete content
          const finalResult = parseContent(accumulatedContent)
          yield {
            chunk: '',
            body: finalResult.body,
            data: finalResult.data,
            isComplete: true,
            excerpt: finalResult.excerpt,
            toc: finalResult.toc,
          }
          break
        }

        const chunkStr = new TextDecoder('utf-8').decode(value)
        accumulatedContent += chunkStr

        // Parse frontmatter if not already done
        if (!frontmatterParsed) {
          const { data } = parseFrontMatter(accumulatedContent)
          frontmatterData = data
          frontmatterParsed = true
        }

        // Auto-close unclosed syntax before parsing intermediate results
        const closedContent = autoCloseMarkdown(accumulatedContent)

        // Parse the auto-closed content
        const result = parseContent(closedContent)

        yield {
          chunk: chunkStr,
          body: result.body,
          data: frontmatterData,
          isComplete: false,
          excerpt: result.excerpt,
        }
      }
    }
    finally {
      reader.releaseLock()
    }
  }
}

/**
 * Alias for parseStream() - kept for backward compatibility
 * @internal
 */
export const parseStreamWithMarkdownIt = parseStream

/**
 * Alias for parseStreamIncremental() - kept for backward compatibility
 * @internal
 */
export const parseStreamIncrementalWithMarkdownIt = parseStreamIncremental

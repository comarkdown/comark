// @ts-expect-error - ignore @nuxtjs/mdc types
import type { MDCRoot } from '@nuxtjs/mdc'
import type { MarkdownDocument, Node } from 'comark'
import remarkGFM from 'remark-gfm'
import remarkMdc, { parseFrontMatter } from 'remark-mdc'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import { unified } from 'unified'
import { mdcCompiler } from './mdc-compiler'

interface HastNode {
  type: 'element' | 'text' | 'comment'
  tag?: string
  value?: string
  props?: Record<string, unknown>
  children?: HastNode[]
}

// -- to minimark

export function fromHast(tree: { type: 'root'; children: HastNode[] }): Node {
  return {
    type: 'minimark',
    value: tree.children.map(hastToMinimarkNode).filter((v) => v !== undefined) as Node[],
  } as any
}

function hastToMinimarkNode(input: HastNode): Node | undefined {
  if (input.type === 'comment') {
    return undefined
  }
  if (input.type === 'text') {
    return input.value
  }

  // remove empty class
  if (input.tag === 'code' && input.props?.className && (input.props.className as string[]).length === 0) {
    delete input.props.className
  }

  return [
    input.tag!,
    input.props || {},
    ...((input.children || []).map(hastToMinimarkNode).filter((v) => v !== undefined) as Node[]),
  ]
}

export interface ParseResult {
  body: MarkdownDocument
  excerpt?: MDCRoot
  data: any
  toc?: any
}

/**
 * Parse markdown using remark (unified) parser
 * This is kept for testing purposes to compare with markdown-it implementation
 */
export function parseWithRemark(source: string): ParseResult {
  const { content, data } = parseFrontMatter(source)
  const processor = unified()

  processor.use(remarkParse).use(remarkGFM).use(remarkMdc).use(remark2rehype).use(mdcCompiler)

  const { result } = processor.processSync(content)

  const { body, excerpt } = result as { body: MDCRoot; excerpt?: MDCRoot }

  // Convert to MarkdownDocument before generating TOC
  const minimarkBody = fromHast(body) as unknown as MarkdownDocument

  return {
    body: minimarkBody,
    excerpt,
    data,
  }
}

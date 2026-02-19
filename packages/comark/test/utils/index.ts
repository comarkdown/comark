import type { MDCRoot } from '@nuxtjs/mdc'
import type { ComarkTree } from 'comark/ast'
import remarkGFM from 'remark-gfm'
import remarkMdc, { parseFrontMatter } from 'remark-mdc'
import remarkParse from 'remark-parse'
import remark2rehype from 'remark-rehype'
import { unified } from 'unified'
import { mdcCompiler } from './mdc-compiler'
import { fromHast } from 'minimark/hast'

export interface ParseResult {
  body: ComarkTree
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

  processor
    .use(remarkParse)
    .use(remarkGFM)
    .use(remarkMdc)
    .use(remark2rehype)
    .use(mdcCompiler)

  const { result } = processor.processSync(content)

  const { body, excerpt } = result as { body: MDCRoot, excerpt?: MDCRoot }

  // Convert to ComarkTree before generating TOC
  const minimarkBody = fromHast(body) as unknown as ComarkTree

  return {
    body: minimarkBody,
    excerpt,
    data,
  }
}

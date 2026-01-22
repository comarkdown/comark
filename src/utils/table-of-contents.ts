import type { MDCElement, MDCNode, MDCRoot } from '../types/tree'
import { flattenNode, flattenNodeText } from './tree'

export interface TocLink {
  id: string
  text: string
  depth: number
  children?: TocLink[]
}

export interface Toc {
  title: string
  depth: number
  searchDepth: number
  links: TocLink[]
}

const TOC_TAGS = ['h2', 'h3', 'h4', 'h5', 'h6']

const TOC_TAGS_DEPTH = TOC_TAGS.reduce((tags: any, tag: string) => {
  tags[tag] = Number(tag.charAt(tag.length - 1))
  return tags
}, {})

const getHeaderDepth = (node: MDCElement): number => TOC_TAGS_DEPTH[node.tag as string]

function getTocTags(depth: number): string[] {
  if (depth < 1 || depth > 5) {
    console.warn(`\`toc.depth\` is set to ${depth}. It should be a number between 1 and 5. `)
    depth = 1
  }

  return TOC_TAGS.slice(0, depth)
}

function nestHeaders(headers: TocLink[]): TocLink[] {
  if (headers.length <= 1) {
    return headers
  }
  const toc: TocLink[] = []
  let parent: TocLink
  headers.forEach((header) => {
    if (!parent || header.depth <= parent.depth) {
      header.children = []
      parent = header
      toc.push(header)
    }
    else {
      parent.children!.push(header)
    }
  })
  toc.forEach((header) => {
    if (header.children?.length) {
      header.children = nestHeaders(header.children)
    }
    else {
      delete header.children
    }
  })
  return toc
}

export function generateFlatToc(body: MDCNode, options: Toc): Toc {
  const { searchDepth, depth, title = '' } = options
  const tags = getTocTags(depth)

  const headers = flattenNode(body, searchDepth).filter((node: MDCNode) => tags.includes((node as MDCElement).tag || ''))

  const links: TocLink[] = headers.map(node => ({
    id: (node as MDCElement).props?.id,
    depth: getHeaderDepth(node as MDCElement),
    text: flattenNodeText(node),
  }))
  return {
    title,
    searchDepth,
    depth,
    links,
  }
}

export function generateToc(body: MDCElement | MDCRoot, options: Toc): Toc {
  const toc = generateFlatToc(body as MDCElement, options)
  toc.links = nestHeaders(toc.links)
  return toc
}

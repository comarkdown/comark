import type { ComarkNode, ComarkTree } from 'comark/ast'

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

const TOC_TAGS_DEPTH = TOC_TAGS.reduce((tags: Record<string, number>, tag: string) => {
  tags[tag] = Number(tag.charAt(tag.length - 1))
  return tags
}, {})

function getTag(node: ComarkNode): string | null {
  if (Array.isArray(node) && node.length >= 1) {
    return node[0] as string
  }
  return null
}

function getProps(node: ComarkNode): Record<string, any> {
  if (Array.isArray(node) && node.length >= 2 && typeof node[1] === 'object' && !Array.isArray(node[1])) {
    return node[1] as Record<string, any>
  }
  return {}
}

function getChildren(node: ComarkNode): ComarkNode[] {
  if (Array.isArray(node) && node.length > 2) {
    return node.slice(2) as ComarkNode[]
  }
  return []
}

function getHeaderDepth(node: ComarkNode): number {
  const tag = getTag(node)
  return tag ? TOC_TAGS_DEPTH[tag] || 0 : 0
}

function getTocTags(depth: number): string[] {
  if (depth < 1 || depth > 5) {
    console.warn(`\`toc.depth\` is set to ${depth}. It should be a number between 1 and 5. `)
    depth = 1
  }

  return TOC_TAGS.slice(0, depth)
}

function flattenNodeText(node: ComarkNode): string {
  if (typeof node === 'string') {
    return node
  }
  if (Array.isArray(node)) {
    return getChildren(node).reduce((text: string, child: ComarkNode) => {
      return text + flattenNodeText(child)
    }, '')
  }
  return ''
}

function flattenNodes(nodes: ComarkNode[], maxDepth: number, currentDepth: number = 0): ComarkNode[] {
  if (currentDepth >= maxDepth) {
    return nodes
  }

  const result: ComarkNode[] = []
  for (const node of nodes) {
    result.push(node)
    if (Array.isArray(node)) {
      const children = getChildren(node)
      if (children.length > 0) {
        result.push(...flattenNodes(children, maxDepth, currentDepth + 1))
      }
    }
  }
  return result
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

export function generateFlatToc(body: ComarkTree, options: Toc): Toc {
  const { searchDepth, depth, title = '' } = options
  const tags = getTocTags(depth)

  const allNodes = flattenNodes(body.value, searchDepth)
  const headers = allNodes.filter((node: ComarkNode) => {
    const tag = getTag(node)
    return tag !== null && tags.includes(tag)
  })

  const links: TocLink[] = headers.map(node => ({
    id: getProps(node).id || '',
    depth: getHeaderDepth(node),
    text: flattenNodeText(node),
  }))

  return {
    title,
    searchDepth,
    depth,
    links,
  }
}

export function generateToc(body: ComarkTree, options: Toc): Toc {
  const toc = generateFlatToc(body, options)
  toc.links = nestHeaders(toc.links)
  return toc
}

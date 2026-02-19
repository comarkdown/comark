export type ComarkText = string

export type ComarkElementAttributes = {
  [key: string]: unknown
}

export type ComarkElement = [string, ComarkElementAttributes, ...ComarkNode[]]

export type ComarkNode = ComarkElement | ComarkText

export type ComarkTree = {
  nodes: ComarkNode[]
  frontmatter: Record<string, any>
  meta: Record<string, any>
}

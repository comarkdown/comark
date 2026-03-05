export type ComarkText = string

export type ComarkComment = [null, {}, string]

export type ComarkElementAttributes = {
  [key: string]: unknown

  $comark?: { line?: number }
}

export type ComarkElement = [string, ComarkElementAttributes, ...ComarkNode[]]

export type ComarkNode = ComarkElement | ComarkText | ComarkComment

export type ComarkTree = {
  nodes: ComarkNode[]
  frontmatter: Record<string, any>
  meta: Record<string, any>
}

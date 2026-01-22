export interface NodePosition {
  start: number
  end: number
}

export interface MDCText {
  type: 'text'
  value: string
  position?: NodePosition
}

export interface MDCComment {
  type: 'comment'
  value: string
  position?: NodePosition
}

export interface MDCElement {
  type: 'element'
  tag: string
  props: Record<string, any> | undefined
  children: Array<MDCElement | MDCText | MDCComment>
  position?: NodePosition
}

export type MDCNode = MDCElement | MDCText | MDCComment

export interface MDCRoot {
  type: 'root'
  children: Array<MDCNode>
}

export interface MDCData extends Record<string, any> {
  title: string
  description: string
}

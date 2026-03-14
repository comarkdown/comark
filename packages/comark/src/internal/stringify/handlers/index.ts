import { code } from './code.ts'
import { pre } from './pre.ts'
import { hr } from './hr.ts'
import { heading } from './heading.ts'
import { p } from './p.ts'
import { a } from './a.ts'
import { ul } from './ul.ts'
import { ol } from './ol.ts'
import { li } from './li.ts'
import { html } from './html.ts'
import { strong } from './strong.ts'
import { emphesis } from './emphesis.ts'
import { blockquote } from './blockquote.ts'
import { img } from './img.ts'
import { del } from './del.ts'
import { mdc } from './mdc.ts'
import { br } from './br.ts'
import { template } from './template.ts'
import { table, thead, tbody, tr, th, td } from './table.ts'
import { comment } from './comment.ts'
import { math } from './math.ts'
import { mermaid } from './mermaid.ts'
import type { NodeHandler } from '../types'

export const handlers: Record<string, NodeHandler> = {
  code,
  pre,
  hr,
  br,
  h1: heading,
  h2: heading,
  h3: heading,
  h4: heading,
  h5: heading,
  h6: heading,
  p,
  a,
  ul,
  ol,
  li,
  html,
  strong,
  em: emphesis,
  blockquote,
  img,
  del,
  mdc,
  template,
  table,
  thead,
  tbody,
  tr,
  th,
  td,
  comment,
  math,
  mermaid,
}

import { heading } from './heading'
import { p } from './p'
import { strong } from './strong'
import { em } from './em'
import { del } from './del'
import { code } from './code'
import { pre } from './pre'
import { a } from './a'
import { blockquote } from './blockquote'
import { ul } from './ul'
import { ol } from './ol'
import { li } from './li'
import { hr } from './hr'
import { br } from './br'
import { img } from './img'
import { table, thead, tbody, tr, th, td } from './table'
import { comment } from './comment'
import { template } from './template'
import type { NodeHandler } from 'comark/render'

export const handlers: Record<string, NodeHandler> = {
  h1: heading,
  h2: heading,
  h3: heading,
  h4: heading,
  h5: heading,
  h6: heading,
  p,
  strong,
  em,
  del,
  code,
  pre,
  a,
  blockquote,
  ul,
  ol,
  li,
  hr,
  br,
  img,
  table,
  thead,
  tbody,
  tr,
  th,
  td,
  comment,
  template,
}

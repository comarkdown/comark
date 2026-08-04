import type { State } from 'comark/render'
import type { ElementNode } from 'comark'
import { textContent } from '../../../utils/index.ts'

export function del(node: ElementNode, _: State) {
  return `~~${textContent(node)}~~`
}

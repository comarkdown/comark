import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'
import { textContent } from '../../../utils/index.ts'

export function del(node: ComarkElement, _: State) {
  return `~~${textContent(node)}~~`
}

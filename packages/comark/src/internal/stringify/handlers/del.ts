import type { State } from 'comark/render'
import type { ComarkElement } from 'comark'
import { textContent } from 'comark/utils'

export function del(node: ComarkElement, _: State) {
  return `~~${textContent(node)}~~`
}

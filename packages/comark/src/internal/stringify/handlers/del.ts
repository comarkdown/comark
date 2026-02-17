import type { State } from '../types'
import type { ComarkElement } from '../../../ast/types'
import { textContent } from '../../../ast'

export function del(node: ComarkElement, _: State) {
  return `~~${textContent(node)}~~`
}

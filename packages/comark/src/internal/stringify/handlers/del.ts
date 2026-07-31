import type { State } from 'comark/render'
import type { MarkdownElement } from 'comark'
import { textContent } from '../../../utils/index.ts'

export function del(node: MarkdownElement, _: State) {
  return `~~${textContent(node)}~~`
}

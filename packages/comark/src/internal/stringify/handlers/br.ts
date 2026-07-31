import type { State } from 'comark/render'
import type { MarkdownElement } from 'comark'

export function br(_: MarkdownElement, _state: State) {
  return '  \n'
}

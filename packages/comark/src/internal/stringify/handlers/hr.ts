import type { State } from 'comark/render'
import type { MarkdownElement } from 'comark'

export function hr(_: MarkdownElement, state: State, parent?: MarkdownElement) {
  if (parent?.[0] === 'p') {
    return ':hr'
  }

  return '---' + state.context.blockSeparator
}

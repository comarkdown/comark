import type { State } from 'comark/render'
import type { ElementNode } from 'comark'

/**
 * Render a node the way a tag with no handler is rendered: as a Comark
 * component (`:name[…]` / `::name`), or as HTML in other formats.
 *
 * Built-in handlers whose tag can also be a component name (`table`, `math`,
 * `template`, …) call this when the node does not have the shape the parser
 * gives their own syntax, so `::table{src="data.csv"}` is not written as an
 * empty Markdown table.
 */
export function component(node: ElementNode, state: State, parent?: ElementNode): string | Promise<string> {
  return state.context.format === 'markdown/comark'
    ? state.handlers.mdc(node, state, parent)
    : state.handlers.html(node, state, parent)
}

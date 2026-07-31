import type { MarkdownDocument } from '../../../comark-svelte/src'
import type { RenderOptions } from 'comark'
import { render } from 'comark/render'

export const renderHTMLForTest = async (tree: MarkdownDocument, options?: RenderOptions) =>
  (await render(tree, { blockSeparator: '\n', format: 'text/html', ...options })).trim()

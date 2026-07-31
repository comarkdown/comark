import type { MarkdownDocument } from '../../../comark-svelte/src'
import type { RendererOptions } from 'comark'
import { render } from 'comark/render'

export const renderHtmlForTest = async (tree: MarkdownDocument, options?: RendererOptions) =>
  (await render(tree, { blockSeparator: '\n', format: 'text/html', ...options })).trim()

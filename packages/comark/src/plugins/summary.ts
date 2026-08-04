import type { Node } from 'comark'
import { applyAutoUnwrap } from '../internal/parse/auto-unwrap.ts'
import { marmdownItTokensToMarkdownDocument } from '../internal/parse/token-processor.ts'
import { defineComarkPlugin } from '../utils/helpers.ts'

export default defineComarkPlugin<{ delimiter?: string }, { summary: Node[] }>((options = {}) => {
  const { delimiter = '<!-- more -->' } = options
  return {
    name: 'summary',
    post(state) {
      let summary: Node[] | undefined

      const delimiterIndex = state.tokens.findIndex(
        (token: any) => token.type === 'html_block' && token.content?.includes(delimiter)
      )

      if (delimiterIndex !== -1) {
        const summaryTokens = state.tokens.slice(0, delimiterIndex)
        summary = marmdownItTokensToMarkdownDocument(summaryTokens)

        // Apply auto-unwrap to summary as well
        if (state.options.autoUnwrap) {
          summary = summary?.map((child: Node) => applyAutoUnwrap(child))
        }

        if (summary) {
          state.tree.meta.summary = summary
        }
      }
    },
  }
})

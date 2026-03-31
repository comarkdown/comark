import type { ComarkNode } from 'comark'
import { applyAutoUnwrap } from '../internal/parse/auto-unwrap.ts'
import { marmdownItTokensToComarkTree } from '../internal/parse/token-processor.ts'
import { defineComarkPlugin } from '../utils/helpers.ts'

export default defineComarkPlugin((options: { delimiter?: string } = {}) => {
  const { delimiter = '<!-- more -->' } = options
  return {
    name: 'summary',
    post(state) {
      let summary: ComarkNode[] | undefined

      const delimiterIndex = state.tokens.findIndex(
        (token: any) => token.type === 'html_block' && token.content?.includes(delimiter),
      )

      if (delimiterIndex !== -1) {
        const summaryTokens = state.tokens.slice(0, delimiterIndex)
        summary = marmdownItTokensToComarkTree(summaryTokens)

        // Apply auto-unwrap to summary as well
        if (state.options.autoUnwrap) {
          summary = summary?.map((child: ComarkNode) => applyAutoUnwrap(child))
        }

        if (summary) {
          state.tree.meta.summary = summary
        }
      }
    },
  }
})

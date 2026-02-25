import type { ComarkNode } from '../ast/types'
import { applyAutoUnwrap } from '../internal/parse/auto-unwrap'
import { marmdownItTokensToComarkTree } from '../internal/parse/token-processor'
import type { ComarkPlugin } from '../types'

export default function summary(delimiter: string = '<!-- more -->'): ComarkPlugin {
  return {
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
}

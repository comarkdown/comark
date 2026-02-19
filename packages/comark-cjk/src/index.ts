import markdownItCjkFriendly from 'markdown-it-cjk-friendly'
import type { ComarkPlugin } from 'comark'

export default function comarkCjk(): ComarkPlugin {
  return {
    markdownItPlugins: [markdownItCjkFriendly],
  }
}

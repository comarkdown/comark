import markdownItCjkFriendly from 'markdown-it-cjk-friendly'
import type { ComarkPlugin, MarkdownItPlugin } from 'comark'

export default function comarkCjk(): ComarkPlugin {
  return {
    markdownItPlugins: [markdownItCjkFriendly as unknown as MarkdownItPlugin],
  }
}

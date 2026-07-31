import { parseMarkdown } from 'comark'
import { stableMarkdown } from '$lib/content'

export const load = async () => {
  return {
    tree: await parseMarkdown(stableMarkdown),
  }
}

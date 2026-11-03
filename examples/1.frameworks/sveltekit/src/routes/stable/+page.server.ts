import { parseMarkdown } from 'comark'
import { stableMarkdown } from '#lib/content.ts'

export const load = async () => {
  return {
    tree: await parseMarkdown(stableMarkdown),
  }
}

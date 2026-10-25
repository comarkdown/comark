import { lazyMarkdown } from '#lib/content.ts'

export const load = () => {
  return {
    markdown: lazyMarkdown,
  }
}

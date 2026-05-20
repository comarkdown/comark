import { lazyMarkdown } from '$lib/content'

export const load = () => {
  return {
    markdown: lazyMarkdown,
  }
}

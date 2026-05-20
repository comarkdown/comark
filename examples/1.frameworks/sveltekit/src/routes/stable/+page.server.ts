import { parse } from '@comark/svelte/parse'
import { stableMarkdown } from '$lib/content'

export const load = async () => {
  return {
    tree: await parse(stableMarkdown),
  }
}

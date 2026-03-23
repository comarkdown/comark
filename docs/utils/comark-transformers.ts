import { createParse } from '@comark/vue/parse'
import highlight from '@comark/vue/plugins/highlight'
import mermaid from '@comark/vue/plugins/mermaid'
import latexLanguage from '@shikijs/langs/latex'
import emoji from '@comark/vue/plugins/emoji'
import toc from '@comark/vue/plugins/toc'
import headings from '@comark/vue/plugins/headings'

import { defineTransformer } from '@nuxt/content'

let parse
export default defineTransformer({
  name: 'markdown',
  extensions: ['.md'],
  parse: async (file) => {
    if (!parse) {
      parse = createParse({
        plugins: [
          highlight({
            languages: [latexLanguage],
          }),
          mermaid(),
          emoji(),
          toc(),
          headings(),
        ],
      })
    }
    const parsed = await parse(file.body)

    const result = {
      id: file.id,
      title: parsed.frontmatter.title,
      description: parsed.frontmatter.description,
      body: {
        type: 'minimark',
        value: parsed.nodes,
        toc: parsed.meta.toc,
      },
      data: parsed.frontmatter,
      meta: parsed.meta,
      ...parsed.frontmatter,
    } as any

    return result
  },
})

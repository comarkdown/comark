import { createMarkdownParser } from 'comark'
import shiki from '@comark/nuxt/plugins/shiki'
import mermaid from '@comark/nuxt/plugins/mermaid'
import latexLanguage from '@shikijs/langs/latex'
import emoji from '@comark/nuxt/plugins/emoji'
import toc from '@comark/nuxt/plugins/toc'
import headings from '@comark/nuxt/plugins/headings'

import { defineTransformer } from '@nuxt/content'

let parseMarkdown
export default defineTransformer({
  name: 'markdown',
  extensions: ['.md'],
  parse: async (file) => {
    if (!parseMarkdown) {
      parseMarkdown = createMarkdownParser({
        plugins: [
          shiki({
            languages: [latexLanguage],
          }),
          mermaid(),
          emoji(),
          toc(),
          headings(),
        ],
      })
    }
    const parsed = await parseMarkdown(file.body)

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

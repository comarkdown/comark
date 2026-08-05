import { defineConfig } from 'vitepress'
import { markdownItComponents } from 'comark/plugins/components'
import { markdownItAttributes } from 'comark/plugins/attributes'

export default defineConfig({
  title: 'Comark + VitePress',
  description: 'Using Comark component syntax inside VitePress.',
  markdown: {
    config(md) {
      md.use(markdownItComponents)
      md.use(markdownItAttributes)
    },
  },
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Demo', link: '/demo' },
    ],
    sidebar: [
      {
        text: 'Examples',
        items: [
          { text: 'Home', link: '/' },
          { text: 'Comark Demo', link: '/demo' },
        ],
      },
    ],
  },
})

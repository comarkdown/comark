import { defineConfig } from 'vitepress'
import pluginMdc from 'markdown-it-mdc'

export default defineConfig({
  title: 'Comark + VitePress',
  description: 'Using Comark component syntax inside VitePress.',
  markdown: {
    config(md) {
      md.use(pluginMdc)
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

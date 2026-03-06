import math from '@comark/plugin-math'
import mermaid from '@comark/plugin-mermaid'
import cjk from '@comark/plugin-cjk'
import { Math } from '@comark/plugin-math/vue'
import { Mermaid } from '@comark/plugin-mermaid/vue'
import ProsePre from './landing/ProsePre.vue'
import highlight from 'comark/plugins/highlight'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

export default defineComarkComponent({
  name: 'ComarkDocs',
  autoClose: true,
  plugins: [
    math(),
    mermaid(),
    cjk(),
    highlight({
      themes: {
        light: githubLight,
        dark: githubDark,
      },
    }),
  ],
  components: {
    Math,
    Mermaid,
    ProsePre,
  },
})

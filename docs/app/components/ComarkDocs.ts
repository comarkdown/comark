import { defineComarkComponent } from '@comark/vue'
import math, { Math } from '@comark/vue/plugins/math'
import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'
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

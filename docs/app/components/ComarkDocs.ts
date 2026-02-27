import { defineComarkComponent } from 'comark/vue'
import math from '@comark/math'
import mermaid from '@comark/mermaid'
import cjk from '@comark/cjk'
import { Math } from '@comark/math/vue'
import { Mermaid } from '@comark/mermaid/vue'
import ProsePre from './landing/ProsePre.vue'
import highlight from 'comark/plugins/highlight'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

export default defineComarkComponent({
  name: 'ComarkDocs',
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

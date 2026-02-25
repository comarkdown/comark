import { defineComarkComponent } from 'comark/vue'
import math from '@comark/math'
import mermaid from '@comark/mermaid'
import cjk from '@comark/cjk'
import { Math } from '@comark/math/vue'
import { Mermaid } from '@comark/mermaid/vue'
import ProsePre from './landing/ProsePre.vue'
import highlight from 'comark/plugins/highlight'

export default defineComarkComponent({
  name: 'ComarkDocs',
  plugins: [
    math(),
    mermaid(),
    cjk(),
    highlight({
      themes: {
        light: 'github-light',
        dark: 'github-dark',
      },
    }),
  ],
  components: {
    Math,
    Mermaid,
    ProsePre,
  },
})

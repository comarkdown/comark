import { defineComarkComponent } from '@comark/vue'
import math, { Math } from '@comark/vue/plugins/math'
import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'
import emoji from '@comark/vue/plugins/emoji'
import ProsePre from './landing/ProsePre.vue'
import highlight from 'comark/plugins/highlight'
import Python from '@shikijs/langs/python'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

// This base renderer created to demonstrate how to create a base renderer for a specific use case.
const BaseComarkDocs = defineComarkComponent({
  name: 'BaseComarkDocs',
  autoClose: true,
  plugins: [
    math(),
    mermaid(),
    emoji(),
  ],
  components: {
    Math,
    Mermaid,
    ProsePre,
  },
})

// This renderer extends the base renderer and adds the syntax highlighting.
export default defineComarkComponent({
  extends: BaseComarkDocs,
  name: 'ComarkDocs',
  plugins: [
    highlight({
      languages: [
        Python,
      ],
      themes: {
        light: githubLight,
        dark: githubDark,
      },
    }),
  ],
})

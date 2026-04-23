import { defineComarkComponent } from '@comark/vue'
import math, { Math } from '@comark/nuxt/plugins/math'
import mermaid, { Mermaid } from '@comark/nuxt/plugins/mermaid'
import emoji from '@comark/nuxt/plugins/emoji'
import ProsePre from './landing/ProsePre.vue'
import highlight from 'comark/plugins/highlight'
import Python from '@shikijs/langs/python'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'
import binding, { Binding } from '@comark/nuxt/plugins/binding'

// This base renderer created to demonstrate how to create a base renderer for a specific use case.w
const BaseComarkDocs = defineComarkComponent({
  name: 'BaseComarkDocs',
  autoClose: true,
  plugins: [math(), mermaid(), emoji(), binding()],
  components: {
    Math,
    Mermaid,
    ProsePre,
    Binding,
  },
})

// This renderer extends the base renderer and adds the syntax highlighting.
export default defineComarkComponent({
  extends: BaseComarkDocs,
  name: 'ComarkDocs',
  plugins: [
    highlight({
      languages: [Python],
      themes: {
        light: githubLight,
        dark: githubDark,
      },
    }),
  ],
})

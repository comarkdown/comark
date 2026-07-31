import { defineMarkdownDocumentComponent } from '@comark/vue'
import { Math } from '@comark/nuxt/plugins/math'
import { Mermaid } from '@comark/nuxt/plugins/mermaid'
import { Binding } from '@comark/nuxt/plugins/binding'

export default defineMarkdownDocumentComponent({
  name: 'ComarkPlaygroundRenderer',
  components: {
    Math,
    Mermaid,
    Binding,
  },
})

import { defineMarkdownDocumentComponent } from '@comark/vue'
import { Math } from '@comark/nuxt/plugins/math'
import { Mermaid } from '@comark/nuxt/plugins/mermaid'

// This base renderer created to demonstrate how to create a base renderer for a specific use case.
const BaseComarkDocsRenderer = defineMarkdownDocumentComponent({
  name: 'ComarkDocsRendererBase',
  components: {
    Math,
  },
})

// This renderer extends the base renderer and adds the Mermaid component.
export default defineMarkdownDocumentComponent({
  extends: BaseComarkDocsRenderer,
  name: 'ComarkDocsRenderer',
  components: {
    Mermaid,
  },
})

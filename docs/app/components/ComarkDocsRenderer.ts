import { defineMarkdownParsedComponent } from '@comark/vue'
import { Math } from '@comark/vue/plugins/math'
import { Mermaid } from '@comark/vue/plugins/mermaid'

// This base renderer created to demonstrate how to create a base renderer for a specific use case.
const BaseComarkDocsRenderer = defineMarkdownParsedComponent({
  name: 'ComarkDocsRendererBase',
  components: {
    Math,
  },
})

// This renderer extends the base renderer and adds the Mermaid component.
export default defineMarkdownParsedComponent({
  extends: BaseComarkDocsRenderer,
  name: 'ComarkDocsRenderer',
  components: {
    Mermaid,
  },
})

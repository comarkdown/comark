import { defineComarkRendererComponent } from '@comark/vue'
import { Math } from '@comark/vue/plugins/math'
import { Mermaid } from '@comark/vue/plugins/mermaid'
import { Binding } from '@comark/vue/plugins/binding'

export default defineComarkRendererComponent({
  name: 'ComarkPlaygroundRenderer',
  components: {
    Math,
    Mermaid,
    Binding,
  },
})

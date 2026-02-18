import type { PropType } from 'vue'
import { defineComponent, h, ref, onMounted, watch } from 'vue'
import mermaid from 'mermaid'

// Initialize mermaid once
mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
})

export const Mermaid = defineComponent({
  name: 'Mermaid',
  props: {
    content: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      default: '',
    },
    height: {
      type: String,
      default: '400px',
    },
    width: {
      type: String,
      default: '100%',
    },
    theme: {
      type: String as PropType<'default' | 'base' | 'dark' | 'forest' | 'neutral' | 'null'>,
      default: 'default',
    },
  },
  setup(props) {
    const svgContent = ref<string>('')
    const error = ref<string | null>(null)

    watch(() => props.theme, () => {
      mermaid.initialize({
        theme: props.theme,
      })
    })

    const renderDiagram = async () => {
      try {
        error.value = null
        const id = `mermaid-${Math.random().toString(36).substring(2, 9)}`
        const { svg } = await mermaid.render(id, props.content)
        svgContent.value = svg
      }
      catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to render diagram'
      }
    }

    onMounted(() => {
      renderDiagram()
    })

    watch(() => [props.content, props.theme], () => {
      renderDiagram()
    })

    return () => {
      return h('div', {
        'class': `mermaid ${props.class}`,
        'style': {
          display: 'flex',
          justifyContent: 'center',
          width: props.width,
          height: props.height,
        },
        'data-error': error.value,
        'innerHTML': svgContent.value,
      })
    }
  },
})

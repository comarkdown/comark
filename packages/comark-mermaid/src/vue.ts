import type { PropType } from 'vue'
import { defineComponent, h, ref, onMounted, watch, computed } from 'vue'
import { renderMermaidSVG, THEMES, type DiagramColors } from 'beautiful-mermaid'
import type { ThemeNames } from '.'

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
      type: [String, Object] as PropType<ThemeNames | DiagramColors>,
      default: 'default',
    },
  },
  setup(props) {
    const svgContent = ref<string>('')
    const error = ref<string | null>(null)

    const beautifulTheme = computed(() => {
      let theme
      if (typeof props.theme === 'string') {
        theme = THEMES[props.theme]
      }
      else if (typeof props.theme === 'object') {
        theme = props.theme
      }

      return theme
    })

    const renderDiagram = () => {
      try {
        error.value = null
        const svg = renderMermaidSVG(props.content, beautifulTheme.value)
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

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
      default: undefined,
    },
    themeDark: {
      type: [String, Object] as PropType<ThemeNames | DiagramColors>,
      default: undefined,
    },
  },
  setup(props) {
    const svgContent = ref<string>('')
    const error = ref<string | null>(null)
    const isDark = ref(false)

    const beautifulTheme = computed(() => {
      // Determine which theme to use based on dark mode and props
      const isDarkMode = isDark.value

      // Get theme-dark prop (using bracket notation for kebab-case prop)
      const themeDarkProp = props.themeDark

      // If dark mode, prefer theme-dark, otherwise prefer theme
      const themeProp = isDarkMode ? themeDarkProp : props.theme

      let theme
      if (typeof themeProp === 'string') {
        theme = THEMES[themeProp]
      }
      else if (typeof themeProp === 'object') {
        theme = themeProp
      }

      // Fallback to default themes if no prop is set
      if (!theme) {
        theme = THEMES[isDarkMode ? 'tokyo-night' : 'tokyo-light']
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
      const htmlEl = document.querySelector('html')

      if (htmlEl) {
        isDark.value = htmlEl.classList.contains('dark') || false

        // Watch for class changes on HTML element
        const observer = new MutationObserver(() => {
          const newIsDark = htmlEl.classList.contains('dark')
          if (newIsDark !== isDark.value) {
            isDark.value = newIsDark
          }
        })

        observer.observe(htmlEl, {
          attributes: true,
          attributeFilter: ['class'],
        })
      }

      renderDiagram()
    })

    // Watch for theme changes (including isDark changes that affect beautifulTheme)
    watch([beautifulTheme, () => props.content, isDark, () => props.theme, () => props.themeDark], () => {
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

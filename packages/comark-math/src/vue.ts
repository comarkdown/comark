import { defineComponent, h, computed, watch, ref } from 'vue'
import katex from 'katex'
import 'katex/dist/katex.min.css'

export const Math = defineComponent({
  name: 'Math',
  props: {
    content: {
      type: String,
      required: true,
    },
    class: {
      type: String,
      default: '',
    },
    __node: {
      type: Object,
      default: () => ({}),
    },
  },
  setup(props) {
    const isInline = computed(() => {
      return props.class?.includes('inline')
    })
    const mathml = ref<string | null>('...')

    watch(() => props.content, () => {
      try {
        mathml.value = katex.renderToString(props.content, {
          throwOnError: true,
          displayMode: !isInline.value,
        })
      }
      catch {
        // Keep loading state on error
      }
    }, { immediate: true })

    if (isInline.value) {
      return () => h('span', {
        class: 'math inline',
        innerHTML: mathml.value,
      })
    }

    return () => h('div', {
      class: 'math block',
      innerHTML: mathml.value,
    })
  },
})

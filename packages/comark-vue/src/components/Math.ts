import { defineAsyncComponent, defineComponent, h } from 'vue'
import { loadKatex, typesetMath } from 'comark/plugins/math'

const Typeset = defineComponent({
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
    return () => {
      const isInline = props.class?.includes('inline')
      const tag = isInline ? 'span' : 'div'
      const className = isInline ? 'math inline' : 'math block'
      const html = typesetMath(props.content, !isInline)
      // Unfinished or invalid TeX, and TeX before KaTeX loads, stays readable as its source.
      return html ? h(tag, { class: className, innerHTML: html }) : h(tag, { class: className }, props.content)
    }
  },
})

// An async component keeps KaTeX out of the initial bundle, and server
// rendering and hydration wait for it.
export const Math = defineAsyncComponent({
  loader: () =>
    loadKatex().then(
      () => Typeset,
      () => Typeset
    ),
  // A copy, since Vue doesn't render the same component again with the same props.
  loadingComponent: { ...Typeset },
  delay: 0,
  suspensible: false,
})

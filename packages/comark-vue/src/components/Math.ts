import { defineAsyncComponent, defineComponent, h, onMounted, onServerPrefetch, ref } from 'vue'

let katex: typeof import('katex').default | undefined
let loading: Promise<unknown> | undefined

function loadKatex(): Promise<unknown> {
  loading ??= import('katex').then(
    (module) => (katex = module.default),
    (error) => {
      loading = undefined
      throw error
    }
  )
  return loading
}

// HTML, `''` when KaTeX can't typeset the formula, or `undefined` before KaTeX loads.
function typeset(tex: string, displayMode: boolean): string | undefined {
  if (!katex) return undefined
  try {
    return katex.renderToString(tex, { throwOnError: true, displayMode })
  } catch {
    return ''
  }
}

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
    // KaTeX failed to load earlier: retry, and typeset once it loads.
    const loaded = ref(katex !== undefined)
    if (!loaded.value) {
      const retry = () =>
        loadKatex().then(
          () => (loaded.value = true),
          () => {}
        )
      onServerPrefetch(retry)
      onMounted(retry)
    }

    return () => {
      void loaded.value
      const isInline = props.class?.includes('inline')
      const tag = isInline ? 'span' : 'div'
      const className = isInline ? 'math inline' : 'math block'
      const html = typeset(props.content, !isInline)
      // Unfinished or invalid TeX, and TeX before KaTeX loads, stays readable as its source.
      return html ? h(tag, { class: className, innerHTML: html }) : h(tag, { class: className }, props.content)
    }
  },
})

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

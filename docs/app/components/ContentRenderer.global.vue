<script setup lang="ts">
import { kebabCase, pascalCase } from 'scule'
import { resolveComponent, toRaw, defineAsyncComponent, computed } from 'vue'
import type { AsyncComponentLoader, PropType } from 'vue'
import htmlTags from '@nuxtjs/mdc/runtime/parser/utils/html-tags-list'
import { globalComponents, localComponents } from '#content/components'
import { useRuntimeConfig } from '#imports'
import { ComarkRenderer } from 'comark/vue'
import { Mermaid } from '@comark/mermaid/vue'
import type { ComarkNode, ComarkTree, ComarkElement } from 'comark/ast'
import type { MinimarkNode, MinimarkTree } from 'minimark'

interface Renderable {
  render?: (props: Record<string, unknown>) => unknown
  ssrRender?: (props: Record<string, unknown>) => unknown
}

const renderFunctions = ['render', 'ssrRender', '__ssrInlineRender'] as const

const props = defineProps({
  /**
   * Content to render
   */
  value: {
    type: Object as PropType<{ id?: string, body: MinimarkTree, summary: MinimarkTree }>,
    required: true,
  },
  /**
   * Render only the summary
   */
  summary: {
    type: Boolean,
    default: false,
  },
  /**
   * Root tag to use for rendering
   */
  tag: {
    type: String,
    default: 'div',
  },
  /**
   * The map of custom components to use for rendering.
   */
  components: {
    type: Object,
    default: () => ({}),
  },

  data: {
    type: Object,
    default: () => ({}),
  },
  /**
   * Whether or not to render Prose components instead of HTML tags
   */
  prose: {
    type: Boolean,
    default: undefined,
  },
  /**
   * Root tag to use for rendering
   */
  class: {
    type: [String, Object],
    default: undefined,
  },
  /**
   * Tags to unwrap separated by spaces
   * Example: 'ul li'
   */
  unwrap: {
    type: [Boolean, String],
    default: false,
  },
})

const debug = import.meta.dev || import.meta.preview

function replaceMermaid(body: MinimarkNode[]): MinimarkNode[] {
  return body.map((node: MinimarkNode): MinimarkNode => {
    if (node[0] === 'pre' && typeof node[1] === 'object' && 'language' in node[1] && node[1].language === 'mermaid') {
      return ['Mermaid', { content: node[1].code }]
    }
    if (Array.isArray(node) && node.length > 2) {
      return [node[0], node[1], ...replaceMermaid(node.slice(2) as MinimarkNode[])]
    }
    return node
  })
}

const body = computed(() => {
  let body = props.value.body || props.value
  if (props.summary && props.value.summary) {
    body = props.value.summary
  }

  // this is a workaround to convert mermaid code block to Mermaid component
  return {
    frontmatter: props.data,
    nodes: replaceMermaid(body.value),
    meta: {},
  } as ComarkTree
})

const isEmpty = computed(() => !body.value?.nodes?.length)

const data = computed(() => {
  const { body, summary, ...data } = props.value
  return {
    ...data,
    ...props.data,
  }
})

const proseComponentMap = Object.fromEntries(['p', 'a', 'blockquote', 'code', 'pre', 'code', 'em', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'hr', 'img', 'ul', 'ol', 'li', 'strong', 'table', 'thead', 'tbody', 'td', 'th', 'tr', 'script'].map(t => [t, `prose-${t}`]))

const { mdc } = useRuntimeConfig().public || {}
const propsDataMDC = computed(() => props.data.mdc)
const tags = computed(() => ({
  ...mdc?.components?.prose && props.prose !== false ? proseComponentMap : {},
  ...mdc?.components?.map || {},
  ...toRaw(propsDataMDC.value?.components || {}),
  ...props.components,
}))

const componentsMap = computed(() => {
  return {
    ...body.value ? resolveContentComponents(body.value, { tags: tags.value }) : {},
    Mermaid,
  }
})

function resolveVueComponent(component: string | Renderable) {
  let _component: unknown = component
  if (typeof component === 'string') {
    if (htmlTags.has(component)) {
      return component
    }
    if (globalComponents.includes(pascalCase(component))) {
      _component = resolveComponent(component, false)
    }
    else if (localComponents.includes(pascalCase(component))) {
      const loader: AsyncComponentLoader = () => {
        return import('#content/components')
          .then((m) => {
            const comp = m[pascalCase(component) as keyof typeof m] as unknown as () => unknown
            return comp ? comp() : undefined
          })
      }
      _component = defineAsyncComponent(loader)
    }
    if (typeof _component === 'string') {
      return _component
    }
  }

  if (!_component) {
    return _component
  }

  const componentObject = _component as Renderable
  if ('__asyncLoader' in componentObject) {
    return componentObject
  }

  if ('setup' in componentObject) {
    return defineAsyncComponent(() => Promise.resolve(componentObject as Renderable))
  }

  return componentObject
}

function resolveContentComponents(body: ComarkTree, meta: Record<string, unknown>) {
  if (!body) {
    return
  }
  const components = Array.from(new Set(loadComponents(body, meta as { tags: Record<string, string> })))
  const result = {} as Record<string, unknown>
  for (const [tag, component] of components) {
    if (result[tag]) {
      continue
    }

    if (typeof component === 'object' && renderFunctions.some(fn => Object.hasOwnProperty.call(component, fn))) {
      result[tag] = component
      continue
    }

    result[tag] = resolveVueComponent(component as string)
  }

  return result as Record<string, unknown>
}

function loadComponents(node: ComarkTree | ComarkElement, documentMeta: { tags: Record<string, string> }) {
  const components2 = [] as Array<[string, unknown]>
  if (Array.isArray((node as ComarkTree).nodes)) {
    for (const child of (node as ComarkTree).nodes || []) {
      if (typeof child === 'string' || child[0] === 'binding' || child[0] === 'comment') {
        continue
      }
      components2.push(...loadComponents(child as ComarkElement, documentMeta))
    }
    return components2
  }

  const tag = (node as ComarkElement)[0]
  if (tag === 'binding' || tag === 'comment') {
    return []
  }
  const renderTag = findMappedTag(node as ComarkElement, documentMeta.tags)
  if (!htmlTags.has(renderTag)) {
    components2.push([tag, renderTag])
  }

  for (let i = 2; i < (node as ComarkElement).length; i++) {
    const child = (node as ComarkElement)[i] as ComarkElement
    if (typeof child === 'string' || child[0] === 'binding' || child[0] === 'comment') {
      continue
    }
    components2.push(...loadComponents((node as ComarkElement)[i] as ComarkElement, documentMeta))
  }
  return components2
}

function findMappedTag(node: ComarkElement, tags: Record<string, string>) {
  const tag = node[0]
  if (!tag || typeof node[1]?.__ignoreMap !== 'undefined') {
    return tag
  }
  return tags[tag] || tags[pascalCase(tag)] || tags[kebabCase(node[0])] || tag
}
</script>

<template>
  <ComarkRenderer
    v-if="!isEmpty"
    :tree="body as unknown as ComarkTree"
    :components="componentsMap"
    :data-content-id="debug ? value.id : undefined"
  />
  <slot
    v-else
    name="empty"
    :tree="body"
    :data="data"
    :data-content-id="debug ? value.id : undefined"
  >
    <!-- nobody -->
  </slot>
</template>

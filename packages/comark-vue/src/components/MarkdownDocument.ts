import type { PropType, VNode } from 'vue'
import type {
  ComponentManifest,
  ComarkContextProvider,
  ElementNode,
  Node,
  MarkdownDocument as MarkdownDocumentType,
  NodeRenderData,
} from 'comark'
import {
  computed,
  defineAsyncComponent,
  defineComponent,
  getCurrentInstance,
  h,
  inject,
  onErrorCaptured,
  onUnmounted,
  ref,
  shallowRef,
  toRaw,
} from 'vue'
import { findLastTextNodeAndAppendNode, getCaret } from '../utils/caret.ts'
import { pascalCase, resolveAttributes } from 'comark/utils'

// Cache for dynamically resolved components
const asyncComponentCache = new Map<string, any>()

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return !!value && typeof (value as { then?: unknown }).then === 'function'
}

function unwrapComponent(mod: unknown): any {
  return mod && typeof mod === 'object' && 'default' in mod ? (mod as { default?: any }).default : mod
}

/**
 * Helper to get tag from a Node
 */
function getTag(node: Node): string | null {
  if (Array.isArray(node) && node.length >= 1) {
    return node[0] as string
  }
  return null
}

/**
 * Helper to get props from a Node
 */
function getProps(node: Node): Record<string, any> {
  if (Array.isArray(node) && node.length >= 2) {
    return (node[1] as Record<string, any>) || {}
  }
  return {}
}

/**
 * Helper to get children from a Node
 */
function getChildren(node: Node): Node[] {
  if (Array.isArray(node) && node.length > 2) {
    return node.slice(2) as Node[]
  }
  return []
}

function resolveComponent(
  tag: string,
  components: Record<string, any>,
  componentsManifest?: ComponentManifest
): string {
  const appComponents = getCurrentInstance()?.appContext?.components
  const pascalTag = pascalCase(tag)
  const proseTag = `Prose${pascalTag}`

  let resolvedComponent =
    components[proseTag] ||
    components[tag] ||
    components[pascalTag] ||
    // If the component is not found in the components map, try to find it in the app context
    appComponents?.[proseTag] ||
    appComponents?.[pascalTag]

  // If not in components map and manifest is provided, try dynamic resolution
  if (!resolvedComponent && componentsManifest) {
    // Check cache first to avoid creating duplicate async components
    const cacheKey = tag
    if (!asyncComponentCache.has(cacheKey)) {
      const resolved = componentsManifest(tag)
      if (isPromiseLike(resolved)) {
        asyncComponentCache.set(
          cacheKey,
          defineAsyncComponent(() => resolved as Promise<any>)
        )
      } else if (resolved) {
        asyncComponentCache.set(cacheKey, unwrapComponent(resolved))
      }
    }
    resolvedComponent = asyncComponentCache.get(cacheKey)
  }

  return resolvedComponent
}
/**
 * Render a single Comark node to Vue VNode
 */
function renderNode(
  node: Node,
  components: Record<string, any> = {},
  key?: string | number,
  componentsManifest?: ComponentManifest,
  parent?: Node,
  renderData: NodeRenderData = { frontmatter: {}, meta: {}, data: {}, props: {} }
): VNode | string | null {
  // Handle text nodes (strings)
  if (typeof node === 'string') {
    return node
  }

  // Handle element nodes (arrays)
  if (Array.isArray(node)) {
    const tag = getTag(node)
    if (!tag) return null

    const nodeProps = getProps(node)
    const children = getChildren(node)

    // Check if there's a custom component for this tag
    let customComponent

    if ((parent as ElementNode | undefined)?.[0] !== 'pre') {
      if (nodeProps.as) {
        customComponent = resolveComponent(nodeProps.as, components, componentsManifest)
      }
      if (!customComponent) {
        customComponent = resolveComponent(tag, components, componentsManifest)
      }
    }

    const component = customComponent || tag

    // Resolve `:prefix` bindings and let Vue-specific attribute mapping run
    // on top (e.g. `className` → `class`).
    const resolved = resolveAttributes(nodeProps, renderData, { parseJson: true })
    const props: Record<string, any> = {}
    for (const k in resolved) {
      if (k === 'className') {
        props.class = resolved[k]
      } else {
        props[k] = resolved[k]
      }
    }

    // @ts-expect-error - component might be a Vue component
    if (component?.props?.__node || component?.__asyncResolved?.props?.__node) {
      props.__node = node
    }

    // Add key if provided
    if (key !== undefined) {
      props.key = key
    }

    if (node.length === 2) {
      return h(component, props)
    }

    // Only shadow the parent's `props` scope when the current element has its
    // own attributes. Bare wrappers (`<p>`, `<ul>`, `<li>`, …) must keep the
    // parent's scope so bindings like `{{ props.x }}` reach across them.
    const hasOwnAttrs = Object.keys(resolved).length > 0
    const childrenRenderData = hasOwnAttrs ? { ...renderData, props } : renderData
    // Separate template elements (slots) from regular children
    const slots: Record<string, () => (VNode | string)[]> = {}
    const regularChildren: (VNode | string)[] = []

    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (child === undefined || child === null) continue

      // Check if this is a slot template (array with tag 'template')
      const childTag = getTag(child)
      const childProps = getProps(child)

      if (childTag === 'template' && childProps) {
        // Find the slot name from props
        // Support both { name: 'title' } and { '#title': '' } formats
        let slotName: string | undefined

        if (childProps.name) {
          slotName = childProps.name
        } else {
          // Use for...in instead of Object.keys().find() — avoids intermediate array
          for (const pk in childProps) {
            if (pk.startsWith('v-slot:')) {
              slotName = pk.substring(7)
              break
            }
          }
        }

        if (slotName) {
          const slotChildren = getChildren(child)
          slots[slotName] = () =>
            slotChildren
              .map((slotChild: Node, idx: number) =>
                renderNode(slotChild, components, idx, componentsManifest, node, childrenRenderData)
              )
              .filter((slotChild): slotChild is VNode | string => slotChild !== null)
          continue
        }
      }

      const rendered = renderNode(child, components, i, componentsManifest, node, childrenRenderData)
      if (rendered !== null) {
        regularChildren.push(rendered)
      }
    }

    // If using a custom component, pass slots
    if (customComponent) {
      // Always include default slot if there are regular children
      if (regularChildren.length > 0) {
        slots.default = () => regularChildren
      }

      return h(component, props, slots)
    }

    // For native HTML tags, pass children directly (ignore slot templates)
    return h(component, props, regularChildren)
  }

  return null
}

/**
 * Props for the MarkdownDocument component
 */
export interface MarkdownDocumentProps {
  /**
   * The parsed Comark document to render — either a full `MarkdownDocument` or a bare
   * `Node[]`.  When a node array is passed, frontmatter and meta
   * default to `{}` and runtime data should be supplied via `data`.
   */
  value?: MarkdownDocumentType | { nodes: MarkdownDocumentType['nodes'] }

  /**
   * Custom component mappings for element tags
   */
  components?: Record<string, any>

  /**
   * Dynamic component resolver function
   */
  componentsManifest?: ComponentManifest

  /**
   * Enable streaming mode with enhanced components
   */
  streaming?: boolean

  /**
   * If caret is true, a caret will be appended to the document's last text node
   */
  caret?: boolean | { class: string }

  /**
   * Additional data to pass to the renderer
   */
  data?: Record<string, unknown>

  /**
   * Document key. When set and `globalThis.comarkContext` exists, the renderer
   * subscribes to live updates for this key (HMR, devtools, collab, agents) and
   * re-renders with the pushed document. No-op otherwise.
   */
  documentKey?: string
}

type MarkdownDocumentComponent = ReturnType<typeof defineComponent<MarkdownDocumentProps>>

/**
 * MarkdownDocument component
 *
 * Renders an already-parsed Markdown document to Vue components/HTML — no parser
 * in the client bundle. Supports custom component mapping for element tags.
 *
 * @example
 * ```vue
 * <template>
 *   <MarkdownDocument :value="document" :components="customComponents" />
 * </template>
 *
 * <script setup lang="ts">
 * import { MarkdownDocument } from '@comark/vue'
 * import CustomHeading from './CustomHeading.vue'
 *
 * const customComponents = {
 *   h1: CustomHeading,
 *   h2: CustomHeading,
 * }
 *
 * const document = await parseMarkdown(`This is **markdown** with components.`)
 * </script>
 * ```
 */
export const MarkdownDocument: MarkdownDocumentComponent = defineComponent({
  name: 'MarkdownDocument',

  props: {
    /**
     * The parsed Markdown document to render
     */
    value: {
      type: Object as PropType<MarkdownDocumentType | { nodes: MarkdownDocumentType['nodes'] }>,
      default: undefined,
    },

    /**
     * Custom component mappings for element tags
     * Key: tag name (e.g., 'h1', 'p', 'MyComponent')
     * Value: Vue component
     */
    components: {
      type: Object as PropType<Record<string, any>>,
      default: () => ({}),
    },

    /**
     * Dynamic component resolver function
     * Used to resolve components that aren't in the components map
     */
    componentsManifest: {
      type: Function as PropType<ComponentManifest>,
      default: undefined,
    },

    /**
     * Enable streaming mode with stream-specific components
     */
    streaming: {
      type: Boolean as PropType<boolean>,
      default: false,
    },

    /**
     * If caret is true, a caret will be appended to the document's last text node
     * If caret is an object, it will be appended with the given class
     */
    caret: {
      type: [Boolean, Object] as PropType<boolean | { class: string }>,
      default: false,
    },

    /**
     * Additional data to pass to the renderer
     */
    data: {
      type: Object as PropType<Record<string, unknown>>,
      default: () => ({}),
    },

    /**
     * Document key used to subscribe to live updates via `globalThis.comarkContext`
     */
    documentKey: {
      type: String as PropType<string>,
      default: undefined,
    },
  },

  async setup(props) {
    const inputDocument = computed(
      () => (props.value ?? { nodes: [], frontmatter: {}, meta: {} }) as MarkdownDocumentType
    )

    const componentErrors = ref(new Set<string>())

    // Live document support: if an ambient context exists, subscribe to updates
    // for this id and re-render with the pushed document. Cleaned up on unmount.
    // The key is the document's own `meta.key` (set by a plugin) or the `documentKey` prop.
    const liveDocument = shallowRef<MarkdownDocumentType | null>(null)
    const key = inputDocument.value.meta?.key || props.documentKey
    if (key && globalThis.comarkContext) {
      const cleanup = globalThis.comarkContext.get(key, toRaw(inputDocument.value)).listen((document) => {
        liveDocument.value = document
      })
      onUnmounted(() => cleanup(true))
    }

    // Capture errors from child components (e.g., during streaming when props are incomplete)
    onErrorCaptured((_err, instance, _info) => {
      // Get component name from instance
      const componentName = (instance?.$?.type as any)?.name || (instance as any)?.type?.name || 'unknown'

      // Track failed component to prevent re-rendering during streaming
      componentErrors.value.add(componentName)

      // Prevent error from propagating (don't crash the app during streaming)
      return false
    })

    const comark = inject<ComarkContextProvider>('comark', { components: {}, componentManifest: () => null })

    const components = computed(() => ({
      ...comark?.components,
      ...props.components,
    }))

    const componentManifest: ComponentManifest = (name: string) => {
      let resolved = props.componentsManifest?.(name)
      if (!resolved) {
        resolved = comark?.componentManifest(name)
      }
      return resolved || null
    }

    const caret = computed<ElementNode | null>(() => getCaret(props.caret || false))

    return () => {
      // Render all nodes from the live document when present, else the value prop
      const rawDocument = toRaw(liveDocument.value ?? inputDocument.value)
      const nodes = [...(rawDocument.nodes || [])]

      if (props.streaming && caret.value && nodes.length > 0) {
        const hasStreamCaret = findLastTextNodeAndAppendNode(nodes[nodes.length - 1] as ElementNode, caret.value)
        if (!hasStreamCaret) {
          nodes.push(caret.value)
        }
      }

      const renderData: NodeRenderData = {
        frontmatter:
          (rawDocument as MarkdownDocumentType).frontmatter ||
          (rawDocument as unknown as { data: Record<string, unknown> }).data ||
          {},
        meta: (rawDocument as MarkdownDocumentType).meta || {},
        data: props.data || {},
        props: {},
      }

      const children = nodes
        .map((node, index) => renderNode(node, components.value, index, componentManifest, undefined, renderData))
        .filter((child): child is VNode | string => child !== null)

      // Wrap in a fragment
      return h('div', { class: 'comark-content' }, children)
    }
  },
})

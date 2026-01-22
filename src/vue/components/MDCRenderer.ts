import type { PropType, VNode } from 'vue'
import type { MDCElement, MDCNode, MDCRoot } from '../../types/tree'
import { defineAsyncComponent, defineComponent, h, onErrorCaptured, ref } from 'vue'

// Cache for dynamically resolved components
const asyncComponentCache = new Map<string, any>()

/**
 * Default HTML tag mappings for MDC elements
 */
const defaultTagMap: Record<string, string> = {
  p: 'p',
  h1: 'h1',
  h2: 'h2',
  h3: 'h3',
  h4: 'h4',
  h5: 'h5',
  h6: 'h6',
  ul: 'ul',
  ol: 'ol',
  li: 'li',
  a: 'a',
  strong: 'strong',
  em: 'em',
  code: 'code',
  pre: 'pre',
  blockquote: 'blockquote',
  hr: 'hr',
  br: 'br',
  img: 'img',
  table: 'table',
  thead: 'thead',
  tbody: 'tbody',
  tr: 'tr',
  th: 'th',
  td: 'td',
  del: 'del',
  div: 'div',
  span: 'span',
}

/**
 * Render a single MDC node to Vue VNode
 */
function renderNode(
  node: MDCNode,
  components: Record<string, any> = {},
  key?: string | number,
  componentsManifest?: (name: string) => Promise<any>,
): VNode | string | null {
  // Handle text nodes
  if (node.type === 'text') {
    return node.value
  }

  // Handle comment nodes (render as HTML comments)
  if (node.type === 'comment') {
    return h('template', null, `<!-- ${node.value} -->`)
  }

  // Handle element nodes
  if (node.type === 'element') {
    const element = node as MDCElement

    // Check if there's a custom component for this tag
    let customComponent = components[element.tag]

    // If not in components map and manifest is provided, try dynamic resolution
    if (!customComponent && componentsManifest && !defaultTagMap[element.tag]) {
      // Check cache first to avoid creating duplicate async components
      const cacheKey = element.tag
      if (!asyncComponentCache.has(cacheKey)) {
        asyncComponentCache.set(
          cacheKey,
          defineAsyncComponent(() => componentsManifest(element.tag)),
        )
      }
      customComponent = asyncComponentCache.get(cacheKey)
    }

    const component = customComponent || defaultTagMap[element.tag] || element.tag

    // Prepare props
    const props: Record<string, any> = { ...(element.props || {}) }
    props.__node = node

    // Add key if provided
    if (key !== undefined) {
      props.key = key
    }

    // Handle self-closing tags
    if (['hr', 'br', 'img'].includes(element.tag)) {
      return h(component, props)
    }

    // Separate template elements (slots) from regular children
    const slots: Record<string, () => (VNode | string)[]> = {}
    const regularChildren: (VNode | string)[] = []

    for (let i = 0; i < element.children.length; i++) {
      const child = element.children[i]
      if (!child)
        continue

      // Check if this is a slot template
      if (child.type === 'element' && child.tag === 'template' && child.props) {
        // Find the slot name from props (e.g., #header, #footer)
        const slotNameProp = Object.keys(child.props).find(key => key.startsWith('#'))
        if (slotNameProp) {
          const slotName = slotNameProp.substring(1) // Remove # prefix
          const slotElement = child as MDCElement
          slots[slotName] = () => slotElement.children
            .map((slotChild: MDCNode, idx: number) => renderNode(slotChild, components, idx, componentsManifest))
            .filter((slotChild): slotChild is VNode | string => slotChild !== null)
        }
      }
      else {
        const rendered = renderNode(child, components, i, componentsManifest)
        if (rendered !== null) {
          regularChildren.push(rendered)
        }
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
 * MDCRenderer component
 *
 * Renders an MDC AST tree to Vue components/HTML.
 * Supports custom component mapping for element tags.
 *
 * @example
 * ```vue
 * <template>
 *   <MDCRenderer :body="mdcAst" :components="customComponents" />
 * </template>
 *
 * <script setup lang="ts">
 * import { MDCRenderer } from 'mdc-syntax/vue'
 * import CustomHeading from './CustomHeading.vue'
 *
 * const customComponents = {
 *   h1: CustomHeading,
 *   h2: CustomHeading,
 * }
 * </script>
 * ```
 */
export const MDCRenderer = defineComponent({
  name: 'MDCRenderer',

  props: {
    /**
     * The MDC AST root to render
     */
    body: {
      type: Object as PropType<MDCRoot>,
      required: true,
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
      type: Function as PropType<(name: string) => Promise<any>>,
      default: undefined,
    },
  },

  setup(props) {
    const componentErrors = ref(new Set<string>())

    // Capture errors from child components (e.g., during streaming when props are incomplete)
    onErrorCaptured((err, instance, info) => {
      // Get component name from instance
      const componentName = (instance?.$?.type as any)?.name || (instance as any)?.type?.name || 'unknown'

      // Log error in development
      if (import.meta.env?.DEV) {
        console.warn(`[MDCRenderer] Error in component "${componentName}":`, err)
        console.warn('Error info:', info)
      }

      // Track failed component to prevent re-rendering during streaming
      componentErrors.value.add(componentName)

      // Prevent error from propagating (don't crash the app during streaming)
      return false
    })

    return () => {
      // Render all children of the root node
      const children = props.body.children
        .map((node, index) => renderNode(node, props.components, index, props.componentsManifest))
        .filter((child): child is VNode | string => child !== null)

      // Wrap in a fragment
      return h('div', { class: 'mdc-content' }, children)
    }
  },
})

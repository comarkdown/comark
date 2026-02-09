import type { PropType, VNode } from 'vue'
import type { MinimarkElement, MinimarkNode, MinimarkTree } from 'minimark'
import { computed, defineAsyncComponent, defineComponent, h, onErrorCaptured } from 'vue'
import { standardProseComponents } from './prose/standard'
import { pascalCase } from 'scule'

// Reusable frozen empty object to avoid per-node allocation when no props exist
const EMPTY_PROPS: Record<string, any> = Object.freeze({})

// Cache pascalCase results — same tags repeat across the document (p, li, a, h1, etc.)
const pascalCaseCache = new Map<string, string>()
function cachedPascalCase(str: string): string {
  let result = pascalCaseCache.get(str)
  if (result === undefined) {
    result = pascalCase(str)
    pascalCaseCache.set(str, result)
  }
  return result
}

function parsePropValue(value: string): any {
  if (value === 'true') return true
  if (value === 'false') return false
  if (value === 'null') return null
  try {
    return JSON.parse(value)
  }
  catch {
    // noop
  }
  return value
}

/**
 * Walk the minimark tree and collect all unique tags.
 * Returns a Set of tag strings found in the tree.
 */
function collectTags(tree: MinimarkTree): Set<string> {
  const tags = new Set<string>()
  function walk(node: MinimarkNode): void {
    if (typeof node === 'string' || !Array.isArray(node) || node.length < 1) return
    const tag = node[0] as string
    if (!tag) return
    tags.add(tag)
    for (let i = 2; i < node.length; i++) {
      walk(node[i] as MinimarkNode)
    }
  }

  for (const node of tree.value) {
    walk(node)
  }
  return tags
}
/**
 * Pre-resolve all tags in the tree against the components map + manifest.
 * Returns a flat map: tag → resolved component (only for non-native tags).
 */
function resolveTreeComponents(
  tree: MinimarkTree,
  components: Record<string, any>,
  componentsManifest?: (name: string) => Promise<any>,
): Record<string, any> {
  const tags = collectTags(tree)
  const resolved: Record<string, any> = {}

  for (const tag of tags) {
    // Look up in components map by raw tag or pascalCase
    let comp = components[tag] || components[cachedPascalCase(tag)]
    // If not found and manifest provided, create async component
    if (!comp && componentsManifest) {
      comp = defineAsyncComponent(() => componentsManifest(tag))
    }
    if (comp) {
      resolved[tag] = comp
    }
  }

  return resolved
}

/**
 * Render a single MDC node to Vue VNode.
 * `resolved` is the pre-resolved tag→component map from setup.
 */
function renderNode(
  node: MinimarkNode,
  resolved: Record<string, any>,
  key: number | undefined,
  parent?: MinimarkNode,
): VNode | string | null {
  // Handle text nodes (strings) — fast path
  if (typeof node === 'string') {
    return node
  }

  // Inline tag access — avoid helper function call overhead on hot path
  const tag = node[0] as string

  // Inline getProps: avoid function call + redundant Array.isArray check
  const nodeProps: Record<string, any> = (node.length >= 2 && node[1]) ? node[1] as Record<string, any> : EMPTY_PROPS

  // Look up pre-resolved component — single hash lookup, no cascading checks
  // Inside <pre>, skip component resolution to preserve raw content
  const customComponent = (parent as MinimarkElement | undefined)?.[0] !== 'pre'
    ? resolved[tag]
    : undefined

  const component = customComponent || tag

  // Prepare props — use for...in instead of Object.entries() to avoid intermediate array allocation
  const props: Record<string, any> = {}
  for (const k in nodeProps) {
    if (k.charCodeAt(0) === 58 /* ':' */) {
      props[k.substring(1)] = parsePropValue(nodeProps[k])
    }
    else {
      props[k] = nodeProps[k]
    }
  }

  if (typeof component !== 'string') {
    props.__node = node
  }

  // Add key if provided
  if (key !== undefined) {
    props.key = key
  }

  // Fast path: no children
  if (node.length < 3) {
    return h(component, props)
  }

  // Process children — iterate by index directly, avoid .slice(2) array allocation
  let slots: Record<string, () => (VNode | string)[]> | null = null
  let regularChildren: (VNode | string)[] = []

  for (let i = 2; i < node.length; i++) {
    const child = node[i] as MinimarkNode

    if (typeof child === 'string') {
      regularChildren.push(child)
      continue
    }

    // Check if this is a slot template — inline check avoids getTag/getProps function call overhead
    if (child[0] === 'template') {
      const childProps = child[1] as Record<string, any>
      let slotName: string | undefined
      if (childProps.name) {
        slotName = childProps.name
      }
      else {
        // Use for...in instead of Object.keys().find() — avoids intermediate array
        for (const pk in childProps) {
          if (pk.startsWith('v-slot:')) {
            slotName = pk.substring(7)
            break
          }
        }
      }
      if (slotName) {
        if (!slots) slots = {}
        // Capture reference for closure — iterate by index to avoid .slice(2) allocation
        const slotNode = child
        slots[slotName] = () => {
          const result: (VNode | string)[] = []
          for (let k = 2; k < slotNode.length; k++) {
            const rendered = renderNode(slotNode[k] as MinimarkNode, resolved, k - 2, node)
            if (rendered !== null) result.push(rendered)
          }
          return result
        }
        continue
      }
    }

    const rendered = renderNode(child, resolved, i - 2, node)
    if (rendered !== null) {
      regularChildren.push(rendered)
    }
  }

  // Custom component: pass slots object
  if (customComponent) {
    if (!slots) slots = {}
    if (regularChildren.length > 0) {
      slots.default = () => regularChildren
    }
    return h(component, props, slots)
  }

  // Native HTML tags: pass children array directly (no slot function overhead)
  return h(component, props, regularChildren || [])
}

/**
 * MDCRenderer component
 *
 * Renders a Minimark tree to Vue components/HTML.
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
     * The Minimark tree to render
     */
    body: {
      type: Object as PropType<MinimarkTree>,
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

    /**
     * Enable streaming mode with stream-specific components
     */
    stream: {
      type: Boolean as PropType<boolean>,
      default: false,
    },
  },

  async setup(props) {
    // Error boundary: capture errors from child components (e.g., during streaming when props are incomplete)
    onErrorCaptured((err, instance, info) => {
      if (import.meta.dev) {
        const name = (instance?.$?.type as any)?.name || (instance as any)?.type?.name || 'unknown'
        console.warn(`[MDCRenderer] Error in component "${name}":`, err, info)
      }
      // Prevent error from propagating (don't crash the app during streaming)
      return false
    })

    const streamComponents = props.stream
      ? await import('mdc-syntax/vue/components/prose/stream').then(m => m.proseStreamComponents)
      : {}

    const components = computed(() => {
      const custom = props.components
      // Fast path: if no custom components, return stream-only (or empty)
      if (!custom || Object.keys(custom).length === 0) {
        return streamComponents
      }
      return Object.assign({}, standardProseComponents, streamComponents, custom)
    })

    // Pre-resolve all tags in the tree against components + manifest once,
    // rather than doing cascading lookups per node during render
    const resolvedComponents = computed(() => {
      return resolveTreeComponents(props.body, components.value, props.componentsManifest)
    })

    return { resolvedComponents }
  },

  render() {
    const resolved = this.resolvedComponents

    const nodes = this.$props.body.value || []

    const children: (VNode | string)[] = []
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (node == null) continue
      const child = renderNode(node, resolved, i)
      if (child !== null) {
        children.push(child)
      }
    }

    return h('div', { class: 'mdc-content' }, children)
  },
})

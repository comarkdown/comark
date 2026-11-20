import type { PropType, VNode } from 'vue'
import type {
  ComponentManifest,
  ComarkContextProvider,
  ElementNode,
  Node,
  MarkdownDocument as MarkdownDocumentType,
  NodeRenderData,
  NodeTransform,
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
import { createStreamRenderer, getChildKeys, resolveStreamEffects } from 'comark/stream'
import type { CaretOptions, FadeOptions, StreamEffect } from 'comark/stream'
import { applyNodeTransforms, pascalCase, resolveAttributes, toNativeAttributes } from 'comark/utils'

const asyncComponentCache = new Map<string, any>()

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return !!value && typeof (value as { then?: unknown }).then === 'function'
}

function unwrapComponent(mod: unknown): any {
  return mod && typeof mod === 'object' && 'default' in mod ? (mod as { default?: any }).default : mod
}

function getTag(node: Node): string | null {
  if (Array.isArray(node) && node.length >= 1) {
    return node[0] as string
  }
  return null
}

function getProps(node: Node): Record<string, any> {
  if (Array.isArray(node) && node.length >= 2) {
    return (node[1] as Record<string, any>) || {}
  }
  return {}
}

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
    components[pascalTag] ||
    components[tag] ||
    appComponents?.[proseTag] ||
    appComponents?.[pascalTag]

  if (!resolvedComponent && componentsManifest) {
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

function renderNode(
  node: Node,
  components: Record<string, any> = {},
  key?: string | number,
  componentsManifest?: ComponentManifest,
  parent?: Node,
  renderData: NodeRenderData = { frontmatter: {}, meta: {}, data: {}, props: {} },
  transformNode?: NodeTransform | readonly NodeTransform[]
): VNode | string | null {
  if (typeof node === 'string') {
    return node
  }

  if (Array.isArray(node)) {
    const nodeTag = getTag(node)
    if (!nodeTag) return null

    const nodeProps = getProps(node)
    const children = getChildren(node)

    const ownProps = resolveAttributes(nodeProps, renderData, { parseJson: true })
    const transformed = applyNodeTransforms(
      transformNode,
      node as ElementNode,
      ownProps,
      renderData,
      parent as ElementNode | undefined
    )
    const tag = transformed ? transformed.tag : nodeTag
    const resolved = transformed ? transformed.props : ownProps
    const as = transformed ? resolved.as : nodeProps.as

    let customComponent

    if ((parent as ElementNode | undefined)?.[0] !== 'pre') {
      // Only a string tag may pick a component: never a value (object, function) from node props
      if (typeof as === 'string' && as) {
        customComponent = resolveComponent(as, components, componentsManifest)
      }
      if (!customComponent) {
        customComponent = resolveComponent(tag, components, componentsManifest)
      }
    }

    const component = customComponent || tag

    let props: Record<string, any> = {}
    for (const k in resolved) {
      if (k === 'className') {
        props.class = resolved[k]
      } else {
        props[k] = resolved[k]
      }
    }
    const scopeProps = props
    if (!customComponent) {
      props = toNativeAttributes(tag, node, props)
    }

    // @ts-expect-error - component might be a Vue component
    if (component?.props?.__node || component?.__asyncResolved?.props?.__node) {
      props.__node = node
    }

    if (key !== undefined) {
      props.key = key
    }

    if (node.length === 2) {
      return h(component, props)
    }

    // Only shadow the parent's `props` scope when the current element has its
    // own attributes. Bare wrappers (`<p>`, `<ul>`, `<li>`, ...) must keep the
    // parent's scope so bindings like `{{ props.x }}` reach across them. The
    // check uses the raw attributes: resolving can omit all of them.
    let hasOwnAttrs = resolved !== ownProps
    for (const key in nodeProps) {
      if (key !== '$') {
        hasOwnAttrs = true
        break
      }
    }
    const childrenRenderData = hasOwnAttrs ? { ...renderData, props: scopeProps } : renderData
    const slots: Record<string, () => (VNode | string)[]> = {}
    const regularChildren: (VNode | string)[] = []
    const childKeys = getChildKeys(children)

    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (child === undefined || child === null) continue

      const childTag = getTag(child)
      const childProps = getProps(child)

      if (childTag === 'template' && childProps) {
        let slotName: string | undefined

        if (childProps.name) {
          slotName = childProps.name
        } else {
          for (const pk in childProps) {
            if (pk.startsWith('v-slot:')) {
              slotName = pk.substring(7)
              break
            }
          }
        }

        if (slotName) {
          const slotChildren = getChildren(child)
          const slotKeys = getChildKeys(slotChildren)
          slots[slotName] = () =>
            slotChildren
              .map((slotChild: Node, idx: number) =>
                renderNode(
                  slotChild,
                  components,
                  slotKeys[idx],
                  componentsManifest,
                  node,
                  childrenRenderData,
                  transformNode
                )
              )
              .filter((slotChild): slotChild is VNode | string => slotChild !== null)
          continue
        }
      }

      const rendered = renderNode(
        child,
        components,
        childKeys[i],
        componentsManifest,
        node,
        childrenRenderData,
        transformNode
      )
      if (rendered !== null) {
        regularChildren.push(rendered)
      }
    }

    if (customComponent) {
      if (regularChildren.length > 0) {
        slots.default = () => regularChildren
      }

      return h(component, props, slots)
    }

    return h(component, props, regularChildren)
  }

  return null
}

/**
 * Props for the MarkdownDocument component
 */
export interface MarkdownDocumentProps {
  /**
   * The parsed Comark document to render: either a full `MarkdownDocument` or
   * `{ nodes }`. When only `nodes` is passed, `frontmatter` and `meta` default
   * to `{}` and runtime data should be supplied via `data`.
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
  caret?: boolean | CaretOptions

  /**
   * Fade in text as it streams
   */
  fade?: boolean | FadeOptions

  /**
   * Custom render-time stream effects, run after `fade` and before `caret`. Put `pace()` first.
   */
  effects?: readonly StreamEffect[]

  /**
   * Additional data to pass to the renderer
   */
  data?: Record<string, unknown>

  /**
   * Change the tag or props of element nodes just before they render.
   * Pass a stable reference: a new array on every render re-renders the document.
   */
  transformNode?: NodeTransform | readonly NodeTransform[]

  /**
   * Document key. When set and `globalThis.comarkContext` exists, the renderer
   * subscribes to live updates for this key (HMR, devtools, collab, agents) and
   * re-renders with the pushed document. No-op otherwise.
   */
  documentKey?: string
}

type MarkdownDocumentComponent = ReturnType<typeof defineComponent<MarkdownDocumentProps>>

/**
 * Runtime prop declarations for `<MarkdownDocument>`, shared with `defineMarkdownDocumentComponent`.
 */
export const markdownDocumentProps = {
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
    type: [Boolean, Object] as PropType<boolean | CaretOptions>,
    default: false,
  },

  /**
   * Fade in text as it streams
   */
  fade: {
    type: [Boolean, Object] as PropType<boolean | FadeOptions>,
    default: false,
  },

  /**
   * Custom render-time stream effects, run after `fade` and before `caret`. Put `pace()` first.
   */
  effects: {
    type: Array as PropType<readonly StreamEffect[]>,
    default: undefined,
  },

  /**
   * Additional data to pass to the renderer
   */
  data: {
    type: Object as PropType<Record<string, unknown>>,
    default: () => ({}),
  },

  /**
   * Change the tag or props of element nodes just before they render
   */
  transformNode: {
    type: [Function, Array] as PropType<NodeTransform | readonly NodeTransform[]>,
    default: undefined,
  },

  /**
   * Document key used to subscribe to live updates via `globalThis.comarkContext`
   */
  documentKey: {
    type: String as PropType<string>,
    default: undefined,
  },
} as const

/**
 * MarkdownDocument component
 *
 * Renders an already-parsed Markdown document to Vue components/HTML, keeping
 * the parser out of the client bundle. Supports custom component mapping for element tags.
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

  props: markdownDocumentProps,

  async setup(props) {
    const inputDocument = computed(
      () => (props.value ?? { nodes: [], frontmatter: {}, meta: {} }) as MarkdownDocumentType
    )

    const componentErrors = ref(new Set<string>())

    // Prefer a plugin-assigned `meta.key` over the `documentKey` prop when subscribing to live updates.
    const liveDocument = shallowRef<MarkdownDocumentType | null>(null)
    const key = inputDocument.value.meta?.key || props.documentKey
    if (key && globalThis.comarkContext) {
      const cleanup = globalThis.comarkContext.get(key, toRaw(inputDocument.value)).listen((document) => {
        liveDocument.value = document
      })
      onUnmounted(() => cleanup(true))
    }

    // Swallow child render errors (e.g. incomplete props mid-stream) so streaming doesn't crash the tree.
    onErrorCaptured((_err, instance, _info) => {
      const componentName = (instance?.$?.type as any)?.name || (instance as any)?.type?.name || 'unknown'
      componentErrors.value.add(componentName)
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

    const stream = createStreamRenderer()
    const effects = computed(() =>
      resolveStreamEffects({ caret: props.caret, fade: props.fade, effects: props.effects })
    )

    // Paced effects release text on a clock, so keep re-rendering until their backlog is empty.
    const frame = ref(0)
    let frameId: number | null = null
    const scheduleFrame = () => {
      if (frameId !== null || typeof requestAnimationFrame !== 'function') return
      frameId = requestAnimationFrame(() => {
        frameId = null
        frame.value++
      })
    }
    onUnmounted(() => {
      if (frameId !== null) cancelAnimationFrame(frameId)
    })

    return () => {
      void frame.value
      const rawDocument = toRaw(liveDocument.value ?? inputDocument.value)
      const nodes = stream.render(rawDocument.nodes || [], { streaming: props.streaming, effects: effects.value })
      if (stream.pending()) scheduleFrame()
      const keys = getChildKeys(nodes)

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
        .map((node, index) =>
          renderNode(node, components.value, keys[index], componentManifest, undefined, renderData, props.transformNode)
        )
        .filter((child): child is VNode | string => child !== null)

      return h('div', { class: 'comark-content' }, children)
    }
  },
})

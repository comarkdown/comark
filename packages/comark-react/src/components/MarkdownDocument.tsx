import type {
  ElementNode,
  Node,
  MarkdownDocument as MarkdownDocumentType,
  ComponentManifest,
  NodeRenderData,
} from 'comark'
import React, { lazy, Suspense, useMemo, useSyncExternalStore, useRef } from 'react'
import { pascalCase, camelCase, resolveAttributes, resolveModelElement, modelElementDisplayValue } from 'comark/utils'
import type { ComarkModel } from 'comark/model'
import { createModelStore } from 'comark/model'
import { findLastTextNodeAndAppendNode, getCaret } from '../utils/caret.ts'

/**
 * Helper to get tag from a Node
 */
function getTag(node: Node): string | null {
  if (Array.isArray(node) && node.length >= 1) {
    return node[0] as string
  }
  return null
}

function cssStringToObject(cssString: string): Record<string, string> {
  return cssString
    .split(';')
    .filter(Boolean)
    .reduce(
      (acc, rule) => {
        const [prop, value] = rule.split(':')
        if (!prop || !value) return acc

        let camelProp = prop.trim()

        if (!prop.startsWith('--')) {
          camelProp = camelCase(camelProp)
        }

        acc[camelProp] = value.trim()
        return acc
      },
      {} as Record<string, string>
    )
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

// Cache for dynamically resolved components
const asyncComponentCache = new Map<string, any>()

function isPromiseLike(value: unknown): value is Promise<unknown> {
  return !!value && typeof (value as { then?: unknown }).then === 'function'
}

function unwrapComponent(mod: unknown): any {
  return mod && typeof mod === 'object' && 'default' in mod ? (mod as { default?: any }).default : mod
}

function resolveComponent(tag: string, components: Record<string, any>, componentsManifest?: ComponentManifest): any {
  const pascalTag = pascalCase(tag)
  const proseTag = `Prose${pascalTag}`

  let resolvedComponent = components[proseTag] || components[pascalTag] || components[tag]

  // If not in components map and manifest is provided, try dynamic resolution
  if (!resolvedComponent && componentsManifest) {
    // Check cache first to avoid creating duplicate async components
    const cacheKey = tag
    if (!asyncComponentCache.has(cacheKey)) {
      const resolved = componentsManifest(tag)
      if (isPromiseLike(resolved)) {
        asyncComponentCache.set(
          cacheKey,
          lazy(() => resolved as Promise<{ default: React.ComponentType<any> }>)
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
 * Render a single Comark node to React element
 */
function renderNode(
  node: Node,
  components: Record<string, any> = {},
  key?: string | number,
  componentsManifest?: ComponentManifest,
  parent?: Node,
  renderData: NodeRenderData = { frontmatter: {}, meta: {}, data: {}, props: {} },
  model?: ComarkModel
): React.ReactNode {
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

    const Component = customComponent || tag

    // Resolve `:prefix` bindings and `::prefix` two-way bindings, then apply
    // React-specific attribute remapping (`class` → `className`, string
    // `style` → object, `tabindex` → `tabIndex`, `onUpdate:X` → `onUpdateX`).
    const resolved = resolveAttributes(nodeProps, renderData, { parseJson: true, model })
    const props: Record<string, any> = {}
    for (const k in resolved) {
      const v = resolved[k]
      if (k === 'className' || k === 'class') {
        props.className = v
      } else if (k === 'style' && typeof v === 'string') {
        props.style = cssStringToObject(v)
      } else if (k === 'tabindex') {
        props.tabIndex = v
      } else if (k.startsWith('onUpdate:') && model) {
        // `onUpdate:prop` → `onUpdateProp` for React props.
        // For native form elements we wire via resolveModelElement below;
        // custom components receive the camelCased handler directly.
        const propName = k.slice('onUpdate:'.length)
        const camelHandler = `onUpdate${propName.charAt(0).toUpperCase()}${propName.slice(1)}`
        props[camelHandler] = v
      } else {
        props[k] = v
      }
    }

    // For native form elements with model bindings, replace the generic
    // update handler with the element-specific event listener and coercion.
    if (model && !customComponent && typeof tag === 'string') {
      for (const rawKey in nodeProps) {
        if (!rawKey.startsWith('::')) continue
        const modelProp = rawKey.slice(2)
        const binding = resolveModelElement(tag, modelProp, nodeProps)
        if (!binding) continue
        const path = nodeProps[rawKey] as string
        const genericHandler = `onUpdate${modelProp.charAt(0).toUpperCase()}${modelProp.slice(1)}`
        delete props[genericHandler]
        const eventProp = `on${binding.event.charAt(0).toUpperCase()}${binding.event.slice(1)}`
        props[eventProp] = (e: React.SyntheticEvent) => model.set(path, binding.coerce(e.target as any))
        props[binding.prop] = modelElementDisplayValue(binding, model.get(path), nodeProps)
      }
    }

    if (typeof Component !== 'string' && (Component as any)?.propTypes?.__node !== undefined) {
      props.__node = node
    }

    // Add key if provided
    if (key !== undefined) {
      props.key = key
    }

    // Handle self-closing tags
    if (['hr', 'br', 'img'].includes(tag)) {
      return React.createElement(Component, props)
    }

    // Only shadow the parent's `props` scope when the current element has its
    // own attributes. Bare wrappers (`<p>`, `<ul>`, `<li>`, …) must keep the
    // parent's scope so bindings like `{{ props.x }}` reach across them.
    const hasOwnAttrs = Object.keys(resolved).length > 0
    const childrenRenderData: NodeRenderData = hasOwnAttrs ? { ...renderData, props } : renderData
    // Separate template elements (slots) from regular children
    const slots: Record<string, React.ReactNode[]> = {}
    const regularChildren: React.ReactNode[] = []

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
            if (pk.startsWith('#')) {
              slotName = pk.substring(1)
              break
            }
          }
        }

        if (slotName) {
          const slotChildren = getChildren(child)
          slots[slotName] = slotChildren
            .map((slotChild: Node, idx: number) =>
              renderNode(slotChild, components, idx, componentsManifest, node, childrenRenderData, model)
            )
            .filter((slotChild): slotChild is React.ReactNode => slotChild !== null)
          continue
        }
      }

      const rendered = renderNode(child, components, i, componentsManifest, node, childrenRenderData, model)
      if (rendered !== null) {
        regularChildren.push(rendered)
      }
    }

    // If using a custom component, pass slots as children props
    if (customComponent) {
      // Always include default slot if there are regular children
      if (regularChildren.length > 0) {
        slots.default = regularChildren
      }

      // For React, we pass slots as props (React doesn't have named slots like Vue)
      const finalProps = { ...props }
      for (const slotName in slots) {
        if (slotName === 'default') {
          // Default slot becomes children
          finalProps.children = slots[slotName]
        } else {
          // Named slots become props with slot prefix
          finalProps[`slot${slotName.charAt(0).toUpperCase() + slotName.slice(1)}`] = slots[slotName]
        }
      }

      // Wrap lazy components in Suspense
      const componentTag = nodeProps.as || tag
      const isLazyComponent = asyncComponentCache.has(componentTag)
      if (isLazyComponent) {
        return (
          <Suspense
            key={key}
            fallback={null}
          >
            {React.createElement(Component, finalProps)}
          </Suspense>
        )
      }

      return React.createElement(Component, finalProps)
    }

    // For native HTML tags, pass children directly (ignore slot templates)
    return React.createElement(Component, props, ...regularChildren)
  }

  return null
}

export interface MarkdownDocumentProps {
  /**
   * The parsed Comark document to render — either a full `MarkdownDocument` or a bare
   * `Node[]`.  When a node array is passed, frontmatter and meta
   * default to `{}` and runtime data should be supplied via `data`.
   */
  value?: MarkdownDocumentType | { nodes: MarkdownDocumentType['nodes'] }

  /**
   * Custom component mappings for element tags
   * Key: tag name (e.g., 'h1', 'p', 'MyComponent')
   * Value: React component
   */
  components?: Record<string, React.ComponentType<any>>

  /**
   * Dynamic component resolver function
   * Used to resolve components that aren't in the components map
   */
  componentsManifest?: ComponentManifest

  /**
   * Enable streaming mode with stream-specific components
   */
  streaming?: boolean

  /**
   * If caret is true, a caret will be appended to the document's last text node
   * If caret is an object, it will be appended with the given class
   */
  caret?: boolean | { class: string }

  /**
   * Additional data to pass to the renderer — referenced from markdown
   * via `:`-prefixed props using dot paths (e.g. `:foo="data.user.name"`).
   */
  data?: Record<string, unknown>

  /**
   * Two-way data binding model. When provided, `::prop="path"` attributes are
   * resolved against the model and update handlers are wired automatically.
   * When omitted the renderer creates an internal uncontrolled store from
   * `data` (controlled mode requires passing your own model).
   */
  model?: ComarkModel

  /**
   * Called after every write accepted by the model. Use this to observe
   * changes in controlled mode without subscribing to the model manually.
   */
  onModelChange?: (path: string, value: unknown, snapshot: Record<string, unknown>) => void

  /**
   * Additional className for the wrapper div
   */
  className?: string
}

/**
 * MarkdownDocument component
 *
 * Renders an already-parsed Markdown document to React components/HTML — no parser
 * in the client bundle. Supports custom component mapping for element tags.
 *
 * @example
 * ```tsx
 * import { MarkdownDocument } from '@comark/react'
 * import CustomHeading from './CustomHeading'
 *
 * const customComponents = {
 *   h1: CustomHeading,
 *   h2: CustomHeading,
 * }
 *
 * export default function App() {
 *   return <MarkdownDocument value={document} components={customComponents} />
 * }
 * ```
 */
/**
 * A React component that subscribes to a model path and re-renders when the
 * value changes. Uses `useSyncExternalStore` for concurrent-mode safety.
 */
function ModelBoundary({
  model,
  children,
}: {
  model: ComarkModel
  children: (version: number) => React.ReactNode
}): React.ReactNode {
  const versionRef = useRef(0)
  const version = useSyncExternalStore(
    (onStoreChange) =>
      model.subscribe('data', () => {
        versionRef.current += 1
        onStoreChange()
      }),
    () => versionRef.current,
    () => 0
  )
  return children(version)
}

export const MarkdownDocument: React.FC<MarkdownDocumentProps> = ({
  value,
  components: customComponents = {},
  componentsManifest,
  streaming = false,
  caret: caretProp = false,
  data,
  model: modelProp,
  onModelChange,
  className,
}) => {
  const document = value ?? { nodes: [] }

  // Uncontrolled mode: create a private model store from `data`.
  const internalModelRef = useRef<ComarkModel | null>(null)
  if (!modelProp && !internalModelRef.current) {
    internalModelRef.current = createModelStore({
      data: { data: data ?? {} },
      onChange: onModelChange,
    })
  }
  const model = modelProp ?? internalModelRef.current ?? undefined

  const caret = useMemo(() => getCaret(caretProp), [caretProp])

  const renderContent = (modelVersion?: number) => {
    // modelVersion used only to trigger re-render when the model updates.
    void modelVersion

    const nodes = [...(document.nodes || [])]

    if (streaming && caret && nodes.length > 0) {
      const hasStreamCaret = findLastTextNodeAndAppendNode(nodes[nodes.length - 1] as ElementNode, caret)
      if (!hasStreamCaret) {
        nodes.push(caret)
      }
    }

    const renderData: NodeRenderData = {
      frontmatter:
        (document as MarkdownDocumentType).frontmatter ||
        (document as unknown as { data: Record<string, unknown> }).data ||
        {},
      meta: (document as MarkdownDocumentType).meta || {},
      data: data || {},
      props: {},
      model,
    }

    const renderedNodes = nodes
      .map((node, index) => renderNode(node, customComponents, index, componentsManifest, undefined, renderData, model))
      .filter((child): child is React.ReactNode => child !== null)

    return <div className={`comark-content ${className || ''}`}>{renderedNodes}</div>
  }

  if (model) {
    return <ModelBoundary model={model}>{(version) => renderContent(version)}</ModelBoundary>
  }

  return renderContent()
}

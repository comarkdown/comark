import type { ComarkElement, ComarkNode, ComarkTree, ComponentManifest, NodeRenderData } from 'comark'
import React, { lazy, Suspense, useMemo } from 'react'
import { pascalCase, camelCase, resolveAttributes } from 'comark/utils'
import { findLastTextNodeAndAppendNode, getCaret } from '../utils/caret.ts'

/**
 * Helper to get tag from a ComarkNode
 */
function getTag(node: ComarkNode): string | null {
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
 * Helper to get props from a ComarkNode
 */
function getProps(node: ComarkNode): Record<string, any> {
  if (Array.isArray(node) && node.length >= 2) {
    return (node[1] as Record<string, any>) || {}
  }
  return {}
}

/**
 * Helper to get children from a ComarkNode
 */
function getChildren(node: ComarkNode): ComarkNode[] {
  if (Array.isArray(node) && node.length > 2) {
    return node.slice(2) as ComarkNode[]
  }
  return []
}

// Cache for dynamically resolved components
const asyncComponentCache = new Map<string, React.LazyExoticComponent<any>>()

function resolveComponent(tag: string, components: Record<string, any>, componentsManifest?: ComponentManifest): any {
  const pascalTag = pascalCase(tag)
  const proseTag = `Prose${pascalTag}`

  let resolvedComponent = components[proseTag] || components[tag] || components[pascalTag]

  // If not in components map and manifest is provided, try dynamic resolution
  if (!resolvedComponent && componentsManifest) {
    // Check cache first to avoid creating duplicate async components
    const cacheKey = tag
    if (!asyncComponentCache.has(cacheKey)) {
      const promise = componentsManifest(tag)
      if (promise) {
        asyncComponentCache.set(
          cacheKey,
          lazy(() => promise as Promise<{ default: React.ComponentType<any> }>)
        )
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
  node: ComarkNode,
  components: Record<string, any> = {},
  key?: string | number,
  componentsManifest?: ComponentManifest,
  parent?: ComarkNode,
  renderData: NodeRenderData = { frontmatter: {}, meta: {}, data: {}, props: {} }
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

    if ((parent as ComarkElement | undefined)?.[0] !== 'pre') {
      if (nodeProps.as) {
        customComponent = resolveComponent(nodeProps.as, components, componentsManifest)
      }
      if (!customComponent) {
        customComponent = resolveComponent(tag, components, componentsManifest)
      }
    }

    const Component = customComponent || tag

    // Resolve `:prefix` bindings, then apply React-specific attribute
    // remapping (`class` → `className`, string `style` → object, `tabindex`
    // → `tabIndex`).
    const resolved = resolveAttributes(nodeProps, renderData, { parseJson: true })
    const props: Record<string, any> = {}
    for (const k in resolved) {
      const v = resolved[k]
      if (k === 'className' || k === 'class') {
        props.className = v
      } else if (k === 'style' && typeof v === 'string') {
        props.style = cssStringToObject(v)
      } else if (k === 'tabindex') {
        props.tabIndex = v
      } else {
        props[k] = v
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
            .map((slotChild: ComarkNode, idx: number) =>
              renderNode(slotChild, components, idx, componentsManifest, node, childrenRenderData)
            )
            .filter((slotChild): slotChild is React.ReactNode => slotChild !== null)
          continue
        }
      }

      const rendered = renderNode(child, components, i, componentsManifest, node, childrenRenderData)
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

export interface ComarkRendererProps {
  /**
   * The Comark tree to render
   */
  tree: ComarkTree

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
   * If caret is true, a caret will be appended to the last text node in the tree
   * If caret is an object, it will be appended to the last text node in the tree with the given class
   */
  caret?: boolean | { class: string }

  /**
   * Additional data to pass to the renderer — referenced from markdown
   * via `:`-prefixed props using dot paths (e.g. `:foo="data.user.name"`).
   */
  data?: Record<string, unknown>

  /**
   * Additional className for the wrapper div
   */
  className?: string
}

/**
 * ComarkRenderer component
 *
 * Renders a Comark tree to React components/HTML.
 * Supports custom component mapping for element tags.
 *
 * @example
 * ```tsx
 * import { ComarkRenderer } from '@comark/react'
 * import CustomHeading from './CustomHeading'
 *
 * const customComponents = {
 *   h1: CustomHeading,
 *   h2: CustomHeading,
 * }
 *
 * export default function App() {
 *   return <ComarkRenderer tree={comarkTree} components={customComponents} />
 * }
 * ```
 */
export const ComarkRenderer: React.FC<ComarkRendererProps> = ({
  tree,
  components: customComponents = {},
  componentsManifest,
  streaming = false,
  caret: caretProp = false,
  data,
  className,
}) => {
  const caret = useMemo(() => getCaret(caretProp), [caretProp])

  const renderedNodes = useMemo(() => {
    // Render all nodes from the tree value
    const nodes = [...(tree.nodes || [])]

    if (streaming && caret && nodes.length > 0) {
      const hasStreamCaret = findLastTextNodeAndAppendNode(nodes[nodes.length - 1] as ComarkElement, caret)
      if (!hasStreamCaret) {
        nodes.push(caret)
      }
    }

    const renderData: NodeRenderData = {
      frontmatter: tree.frontmatter,
      meta: tree.meta,
      data: data || {},
      props: {},
    }

    return nodes
      .map((node, index) => renderNode(node, customComponents, index, componentsManifest, undefined, renderData))
      .filter((child): child is React.ReactNode => child !== null)
  }, [tree, customComponents, componentsManifest, streaming, caret, data])

  // Wrap in a fragment
  return <div className={`comark-content ${className || ''}`}>{renderedNodes}</div>
}

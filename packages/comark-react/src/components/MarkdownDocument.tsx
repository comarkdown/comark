import type {
  ElementNode,
  Node,
  MarkdownDocument as MarkdownDocumentType,
  ComponentManifest,
  NodeRenderData,
  NodeTransform,
} from 'comark'
import React, { lazy, Suspense, useMemo } from 'react'
import {
  applyNodeTransforms,
  isHtmlVoidElement,
  pascalCase,
  camelCase,
  resolveAttributes,
  toNativeAttributes,
} from 'comark/utils'
import { getChildKeys } from 'comark/stream'
import type { StreamEffect } from 'comark/stream'
import { MarkdownDocumentStream } from './MarkdownDocumentStream.tsx'

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

  if (!resolvedComponent && componentsManifest) {
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

function renderNode(
  node: Node,
  components: Record<string, any> = {},
  key?: string | number,
  componentsManifest?: ComponentManifest,
  parent?: Node,
  renderData: NodeRenderData = { frontmatter: {}, meta: {}, data: {}, props: {} },
  transformNode?: NodeTransform | readonly NodeTransform[],
  streamKeys = false
): React.ReactNode {
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

    // `componentTag` is the name the component resolved under, which keys `asyncComponentCache`.
    let customComponent
    let componentTag = tag

    if ((parent as ElementNode | undefined)?.[0] !== 'pre') {
      if (typeof as === 'string' && as) {
        customComponent = resolveComponent(as, components, componentsManifest)
        if (customComponent) componentTag = as as string
      }
      if (!customComponent) {
        customComponent = resolveComponent(tag, components, componentsManifest)
      }
    }

    const Component = customComponent || tag

    let props: Record<string, any> = {}
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

    const scopeProps = props
    if (!customComponent) {
      props = toNativeAttributes(tag, node, props)
    }

    if (typeof Component !== 'string' && (Component as any)?.propTypes?.__node !== undefined) {
      props.__node = node
    }

    if (key !== undefined) {
      props.key = key
    }

    // Native void elements take no children, and React throws if they get
    // any, including a `children` prop. A transform can turn any node into
    // one. Custom components keep the normal path, with children and Suspense.
    if (!customComponent && isHtmlVoidElement(tag)) {
      if ('children' in props) {
        const { children: _children, ...voidProps } = props
        props = voidProps
      }
      return React.createElement(Component, props)
    }

    // Only shadow the parent's `props` scope when the current element has its
    // own attributes. Bare wrappers (`<p>`, `<ul>`, `<li>`, ...) must keep the
    // parent's scope so bindings like `{{ props.x }}` reach across them. The
    // check uses the raw attributes: resolving can omit all of them. Props a
    // transform returned count as the element's own.
    let hasOwnAttrs = resolved !== ownProps
    for (const key in nodeProps) {
      if (key !== '$') {
        hasOwnAttrs = true
        break
      }
    }
    const childrenRenderData: NodeRenderData = hasOwnAttrs ? { ...renderData, props: scopeProps } : renderData
    const slots: Record<string, React.ReactNode[]> = {}
    const regularChildren: React.ReactNode[] = []
    const childKeys = streamKeys ? getChildKeys(children) : undefined

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
            if (pk.startsWith('#')) {
              slotName = pk.substring(1)
              break
            }
          }
        }

        if (slotName) {
          const slotChildren = getChildren(child)
          const slotKeys = streamKeys ? getChildKeys(slotChildren) : undefined
          slots[slotName] = slotChildren
            .map((slotChild: Node, idx: number) =>
              renderNode(
                slotChild,
                components,
                slotKeys ? slotKeys[idx] : idx,
                componentsManifest,
                node,
                childrenRenderData,
                transformNode,
                streamKeys
              )
            )
            .filter((slotChild): slotChild is React.ReactNode => slotChild !== null)
          continue
        }
      }

      const rendered = renderNode(
        child,
        components,
        childKeys ? childKeys[i] : i,
        componentsManifest,
        node,
        childrenRenderData,
        transformNode,
        streamKeys
      )
      if (rendered !== null) {
        regularChildren.push(rendered)
      }
    }

    if (customComponent) {
      if (regularChildren.length > 0) {
        slots.default = regularChildren
      }

      const finalProps = { ...props }
      for (const slotName in slots) {
        if (slotName === 'default') {
          finalProps.children = slots[slotName]
        } else {
          finalProps[`slot${slotName.charAt(0).toUpperCase() + slotName.slice(1)}`] = slots[slotName]
        }
      }

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

    return React.createElement(Component, props, ...regularChildren)
  }

  return null
}

/**
 * Every other HTML attribute (`id`, `style`, `role`, `data-*`, `aria-*`, ...) is
 * set on the wrapper div.
 */
export interface MarkdownDocumentProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
  /**
   * The parsed Comark document to render: either a full `MarkdownDocument` or
   * `{ nodes }`. When only `nodes` is passed, `frontmatter` and `meta` default
   * to `{}` and runtime data should be supplied via `data`.
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
   * Render-time stream effects such as `caret()`, `fade()` and `pace()` from `comark/stream`. They run in order.
   */
  effects?: readonly StreamEffect[]

  /**
   * Additional data to pass to the renderer, referenced from markdown
   * via `:`-prefixed props using dot paths (e.g. `:foo="data.user.name"`).
   */
  data?: Record<string, unknown>

  /**
   * Change the tag or props of element nodes just before they render.
   * Pass a stable reference: a new array on every render re-renders the document.
   */
  transformNode?: NodeTransform | readonly NodeTransform[]

  /**
   * Additional className for the wrapper div
   */
  className?: string
}

/**
 * MarkdownDocument component
 *
 * Renders an already-parsed Markdown document to React components/HTML, keeping
 * the parser out of the client bundle. Supports custom component mapping for element tags.
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
export const MarkdownDocument: React.FC<MarkdownDocumentProps> = (props) => {
  // Effects keep state between renders, so only they need the client renderer. Without them this path
  // uses only `useMemo`, which React Server Components support.
  const streamed = Boolean(props.effects?.length)
  const { value, components, componentsManifest, data, transformNode } = props
  const rendered = useMemo(
    () => (streamed ? null : renderDocumentNodes(value?.nodes || [], props)),
    [streamed, value, components, componentsManifest, data, transformNode]
  )
  if (streamed) return <MarkdownDocumentStream {...props} />

  const {
    value: _value,
    components: _components,
    componentsManifest: _componentsManifest,
    streaming: _streaming,

    effects: _effects,
    data: _data,
    transformNode: _transformNode,
    className,
    ...rest
  } = props

  return (
    <div
      {...rest}
      className={`comark-content ${className || ''}`}
    >
      {rendered}
    </div>
  )
}

/**
 * Render top-level `nodes` of `props.value`. Pass `keys` (from `getChildKeys`) when stream effects
 * ran, so effect-inserted nodes keep their `$.key`; otherwise children use index keys.
 */
export function renderDocumentNodes(
  nodes: readonly Node[],
  { value, components = {}, componentsManifest, data, transformNode }: MarkdownDocumentProps,
  keys?: readonly string[]
): React.ReactNode[] {
  const document = value ?? { nodes: [] }
  const renderData: NodeRenderData = {
    frontmatter:
      (document as MarkdownDocumentType).frontmatter ||
      (document as unknown as { data: Record<string, unknown> }).data ||
      {},
    meta: (document as MarkdownDocumentType).meta || {},
    data: data || {},
    props: {},
  }

  return nodes
    .map((node, index) =>
      renderNode(
        node,
        components,
        keys ? keys[index] : index,
        componentsManifest,
        undefined,
        renderData,
        transformNode,
        !!keys
      )
    )
    .filter((child): child is React.ReactNode => child !== null)
}

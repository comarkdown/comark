import {
  Component,
  ComponentRef,
  ChangeDetectionStrategy,
  ViewContainerRef,
  ElementRef,
  Renderer2,
  OnChanges,
  SimpleChanges,
  Type,
  Injector,
  EnvironmentInjector,
  createComponent,
  reflectComponentType,
  inject,
  input,
} from '@angular/core'
import type { ElementNode, Node as MarkdownAstNode, NodeRenderData, NodeTransform } from 'comark'
import { resolveIfWrapper, selectIfBranch, shouldRenderIf, type IfProps } from 'comark/plugins/binding'
import { getChildKeys } from 'comark/stream'
import { applyNodeTransforms, isHtmlVoidElement, pascalCase, resolveAttributes, toNativeAttributes } from 'comark/utils'

interface StructuralComponent extends Type<any> {
  ɵcomarkIf?: boolean
}

function getTag(node: MarkdownAstNode): string | null {
  if (Array.isArray(node) && node.length >= 1) {
    return node[0] as string
  }
  return null
}

function getProps(node: MarkdownAstNode): Record<string, any> {
  if (Array.isArray(node) && node.length >= 2) {
    return (node[1] as Record<string, any>) || {}
  }
  return {}
}

function getChildren(node: MarkdownAstNode): MarkdownAstNode[] {
  if (Array.isArray(node) && node.length > 2) {
    return node.slice(2) as MarkdownAstNode[]
  }
  return []
}

function resolveComponent(tag: string, components: Record<string, Type<any>>): Type<any> | undefined {
  const pascalTag = pascalCase(tag)
  const proseTag = `Prose${pascalTag}`
  return components[proseTag] || components[pascalTag] || components[tag]
}

interface PreparedNode {
  tag: string
  props: Record<string, any>
  customComponent?: Type<any>
  childrenRenderData: NodeRenderData
}

function prepareNode(
  node: ElementNode,
  components: Record<string, Type<any>>,
  renderData: NodeRenderData,
  parent: MarkdownAstNode | undefined,
  transformNode: NodeTransform | readonly NodeTransform[] | undefined
): PreparedNode {
  const nodeProps = getProps(node)
  const ownProps = resolveAttributes(nodeProps, renderData, { parseJson: true })
  const transformed = applyNodeTransforms(transformNode, node, ownProps, renderData, parent as ElementNode | undefined)
  const tag = transformed ? transformed.tag : node[0]
  const props = transformed ? transformed.props : ownProps
  const as = transformed ? props.as : nodeProps.as

  let customComponent: Type<any> | undefined
  if ((parent as ElementNode | undefined)?.[0] !== 'pre') {
    if (typeof as === 'string' && as) {
      customComponent = resolveComponent(as, components)
    }
    if (!customComponent) {
      customComponent = resolveComponent(tag, components)
    }
  }

  // Only shadow the parent scope when the element has its own attributes.
  // The check uses the raw attributes: resolving can omit all of them. Props
  // a transform returned count as the element's own.
  let hasOwnAttrs = props !== ownProps
  for (const key in nodeProps) {
    if (key !== '$') {
      hasOwnAttrs = true
      break
    }
  }
  const childrenRenderData: NodeRenderData = hasOwnAttrs ? { ...renderData, props } : renderData
  return { tag, props, customComponent, childrenRenderData }
}

/** DOM attribute values for resolved props; `innerHTML` and `as` are never applied. */
function toDomAttributes(attrs: Record<string, any>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const key in attrs) {
    const value = attrs[key]
    if (key === 'as' || key === 'innerHTML' || key === 'dangerouslySetInnerHTML') {
      continue
    } else if (key === 'className' || key === 'class') {
      out.class = String(value)
    } else if (typeof value === 'boolean') {
      if (value) out[key] = ''
    } else if (value != null) {
      out[key] = String(value)
    }
  }
  return out
}

/** Structural equality, bounded in depth. Streaming re-parses rebuild unchanged nodes in the active block. */
export function isSameValue(a: unknown, b: unknown, depth = 0): boolean {
  if (a === b) return true
  if (depth > 50 || typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) return false
  if (Array.isArray(a)) {
    if (!Array.isArray(b) || a.length !== b.length) return false
    for (let i = 0; i < a.length; i++) if (!isSameValue(a[i], b[i], depth + 1)) return false
    return true
  }
  if (Array.isArray(b) || !isPlainObject(a) || !isPlainObject(b)) return false
  const aKeys = Object.keys(a)
  if (aKeys.length !== Object.keys(b).length) return false
  for (const key of aKeys) {
    if (!isSameValue((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key], depth + 1)) return false
  }
  return true
}

function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value)
  return proto === Object.prototype || proto === null
}

function isSameRenderData(a: NodeRenderData, b: NodeRenderData): boolean {
  return (
    a === b ||
    (a.frontmatter === b.frontmatter && a.meta === b.meta && a.data === b.data && isSameValue(a.props, b.props))
  )
}

/** What a child rendered last time, so the next render can patch it in place. */
type RenderedChild =
  | { kind: 'text'; key: string; node: string; dom: Text }
  | {
      kind: 'element'
      key: string
      node: ElementNode
      tag: string
      attrs: Record<string, string>
      dom: HTMLElement
      children: RenderedChild[]
      renderData: NodeRenderData
    }
  | {
      kind: 'component'
      key: string
      node: ElementNode
      ref: ComponentRef<MarkdownNode>
      dom: HTMLElement
      renderData: NodeRenderData
      parent: MarkdownAstNode | undefined
    }

function destroyComponents(children: RenderedChild[]): void {
  for (const child of children) {
    if (child.kind === 'component') child.ref.destroy()
    else if (child.kind === 'element') destroyComponents(child.children)
  }
}

/**
 * MarkdownNode - recursive component that renders a single Comark AST node.
 *
 * For text nodes, it inserts the text directly.
 * For element nodes, it creates a native DOM element or instantiates
 * a custom Angular component via ViewContainerRef.
 *
 * Native subtrees are patched in place on updates: unchanged children keep their DOM nodes, so
 * streaming only touches what changed and CSS animations on new nodes (stream fade) play once.
 */
@Component({
  selector: 'comark-markdown-node',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class MarkdownNode implements OnChanges {
  /** The Comark AST node to render */
  readonly node = input.required<MarkdownAstNode>()

  /** Custom component mappings */
  readonly components = input<Record<string, Type<any>>>({})

  /** Render data for :binding resolution */
  readonly renderData = input<NodeRenderData>({ frontmatter: {}, meta: {}, data: {}, props: {} })

  /** Parent node (for context like `pre` tag detection) */
  readonly parent = input<MarkdownAstNode>()

  /** Change the tag or props of element nodes just before they render */
  readonly transformNode = input<NodeTransform | readonly NodeTransform[]>()

  private vcr = inject(ViewContainerRef)
  private renderer = inject(Renderer2)
  private elementRef = inject(ElementRef)
  private injector = inject(Injector)

  /** The root this node rendered last, when it can be patched (text or native element). */
  private root: RenderedChild | null = null
  private rootContext: { components: unknown; transformNode: unknown } | null = null
  /** Inputs of the last custom component render, to skip re-creating it for an equal node. */
  private componentInputs: {
    node: MarkdownAstNode
    components: unknown
    renderData: NodeRenderData
    transformNode: unknown
    tag: string
    props: Record<string, any>
    customComponent: Type<any>
  } | null = null

  ngOnChanges(_changes: SimpleChanges): void {
    this.render()
  }

  private render(): void {
    const node = this.node()
    if (this.patchRoot(node)) return

    const prepared =
      Array.isArray(node) && getTag(node)
        ? prepareNode(node as ElementNode, this.components(), this.renderData(), this.parent(), this.transformNode())
        : null
    // Compare the prepared output too: a transform can read the parent, which may change on its own.
    const last = this.componentInputs
    if (
      last &&
      prepared &&
      last.components === this.components() &&
      last.transformNode === this.transformNode() &&
      isSameRenderData(last.renderData, this.renderData()) &&
      isSameValue(last.node, node) &&
      last.customComponent === prepared.customComponent &&
      last.tag === prepared.tag &&
      isSameValue(last.props, prepared.props)
    ) {
      return
    }

    this.vcr.clear()
    this.root = null
    this.rootContext = null
    this.componentInputs = null

    const hostEl = this.elementRef.nativeElement as HTMLElement
    while (hostEl.firstChild) {
      hostEl.removeChild(hostEl.firstChild)
    }

    if (node === undefined || node === null) return

    if (typeof node === 'string') {
      const text = this.renderer.createText(node)
      this.renderer.appendChild(hostEl, text)
      this.root = { kind: 'text', key: '', node, dom: text }
      return
    }

    if (prepared) {
      const children = getChildren(node)
      const { tag, props: resolved, customComponent, childrenRenderData } = prepared

      if ((customComponent as StructuralComponent | undefined)?.ɵcomarkIf) {
        this.renderIf(resolved, children, childrenRenderData)
      } else if (customComponent) {
        this.renderCustomComponent(customComponent, resolved, children, childrenRenderData)
        this.componentInputs = {
          node,
          components: this.components(),
          renderData: this.renderData(),
          transformNode: this.transformNode(),
          tag,
          props: resolved,
          customComponent,
        }
      } else {
        this.root = this.renderNativeEl(hostEl, tag, resolved, children, childrenRenderData, node, null)
        this.rootContext = { components: this.components(), transformNode: this.transformNode() }
      }
    }
  }

  /** Update the previous text or native element root in place. Returns `false` when it must rebuild. */
  private patchRoot(node: MarkdownAstNode): boolean {
    const root = this.root
    if (!root) return false
    if (typeof node === 'string') {
      if (root.kind !== 'text') return false
      if (root.node !== node) root.dom.data = node
      root.node = node
      return true
    }
    if (root.kind !== 'element' || !Array.isArray(node) || !getTag(node)) return false
    const context = this.rootContext
    if (!context || context.components !== this.components() || context.transformNode !== this.transformNode()) {
      return false
    }
    const prepared = prepareNode(
      node as ElementNode,
      this.components(),
      this.renderData(),
      this.parent(),
      this.transformNode()
    )
    if (prepared.customComponent || prepared.tag !== root.tag) return false
    this.patchElement(root, node as ElementNode, prepared)
    return true
  }

  private patchElement(
    entry: Extract<RenderedChild, { kind: 'element' }>,
    node: ElementNode,
    prepared: PreparedNode
  ): void {
    const attrs = toDomAttributes(toNativeAttributes(prepared.tag, node, prepared.props))
    for (const key in entry.attrs) {
      if (!(key in attrs)) this.renderer.removeAttribute(entry.dom, key)
    }
    for (const key in attrs) {
      if (entry.attrs[key] !== attrs[key]) this.renderer.setAttribute(entry.dom, key, attrs[key])
    }
    entry.attrs = attrs
    entry.node = node
    entry.renderData = prepared.childrenRenderData
    if (!isHtmlVoidElement(prepared.tag)) {
      entry.children = this.patchChildren(
        entry.dom,
        entry.children,
        getChildren(node),
        prepared.childrenRenderData,
        node
      )
    }
  }

  private renderNativeEl(
    parentEl: HTMLElement,
    tag: string,
    attrs: Record<string, any>,
    children: MarkdownAstNode[],
    childrenRenderData: NodeRenderData,
    node: MarkdownAstNode | undefined,
    before: Node | null,
    key = ''
  ): Extract<RenderedChild, { kind: 'element' }> {
    const el = this.renderer.createElement(tag)
    const domAttrs = toDomAttributes(node ? toNativeAttributes(tag, node, attrs) : attrs)
    for (const name in domAttrs) this.renderer.setAttribute(el, name, domAttrs[name])

    // `innerHTML` from document attributes is never applied; resolveAttributes
    // drops DOM sink props, and raw HTML has its own explicit parse path.
    const rendered = isHtmlVoidElement(tag) ? [] : this.patchChildren(el, [], children, childrenRenderData, node)

    if (before) this.renderer.insertBefore(parentEl, el, before)
    else this.renderer.appendChild(parentEl, el)
    return {
      kind: 'element',
      key,
      node: node as ElementNode,
      tag,
      attrs: domAttrs,
      dom: el,
      children: rendered,
      renderData: childrenRenderData,
    }
  }

  /** Evaluate an `::if` before rendering any of its descendants. */
  private renderIf(props: IfProps, children: MarkdownAstNode[], childrenRenderData: NodeRenderData): void {
    const branch = selectIfBranch(children, shouldRenderIf(props))
    if (!branch) return

    const hostEl = this.elementRef.nativeElement as HTMLElement
    const wrapper = resolveIfWrapper(props.as)
    if (wrapper) {
      this.renderNativeEl(hostEl, wrapper, {}, branch, childrenRenderData, undefined, null)
    } else {
      this.renderChildren(hostEl, branch, childrenRenderData)
    }
  }

  private renderCustomComponent(
    componentType: Type<any>,
    attrs: Record<string, any>,
    children: MarkdownAstNode[],
    childrenRenderData: NodeRenderData
  ): void {
    const slots: Record<string, MarkdownAstNode[]> = {}
    const regularChildren: MarkdownAstNode[] = []

    for (const child of children) {
      if (child === undefined || child === null) continue

      const childTag = getTag(child)
      const childProps = getProps(child)

      if (childTag === 'template' && childProps) {
        let slotName: string | undefined

        if (childProps.name) {
          slotName = childProps.name
        } else {
          for (const pk in childProps) {
            if (pk.startsWith('v-slot:') || pk.startsWith('#')) {
              slotName = pk.startsWith('#') ? pk.substring(1) : pk.substring(7)
              break
            }
          }
        }

        if (slotName) {
          slots[slotName] = getChildren(child)
          continue
        }
      }

      regularChildren.push(child)
    }

    // Pre-render children into a temporary container so their DOM nodes can be
    // passed as `projectableNodes` to Angular's `<ng-content />` projection.
    const tempContainer = this.renderer.createElement('div')

    if (regularChildren.length > 0) {
      this.renderChildren(tempContainer, regularChildren, childrenRenderData)
    }

    if (slots['default']) {
      this.renderChildren(tempContainer, slots['default'], childrenRenderData)
    }

    const defaultSlotNodes: Node[] = Array.from(tempContainer.childNodes)

    // Index 0 of projectableNodes feeds the default `<ng-content />`.
    const projectableNodes: Node[][] = [defaultSlotNodes]

    const componentRef = createComponent(componentType, {
      environmentInjector: this.injector.get(EnvironmentInjector),
      elementInjector: this.injector,
      projectableNodes,
    })

    const mirror = reflectComponentType(componentType)
    const inputNames = new Set(mirror?.inputs.map((i) => i.propName) || [])

    for (const key in attrs) {
      if (key === 'as') continue
      if (inputNames.has(key)) {
        componentRef.setInput(key, attrs[key])
      }
    }

    if (inputNames.has('__node')) {
      componentRef.setInput('__node', this.node())
    }

    for (const slotName in slots) {
      if (slotName === 'default') continue
      const slotEl = this.renderer.createElement('div')
      this.renderer.setAttribute(slotEl, 'slot', slotName)
      this.renderer.setStyle(slotEl, 'display', 'contents')
      this.renderChildren(slotEl, slots[slotName], childrenRenderData)
      this.renderer.appendChild(componentRef.location.nativeElement, slotEl)
    }

    this.vcr.insert(componentRef.hostView)

    // The container's anchor stays where this node was first attached, so when this node
    // was moved into a parent element, place the component right after this node's host.
    const hostEl = this.elementRef.nativeElement as HTMLElement
    const hostParent = this.renderer.parentNode(hostEl)
    if (hostParent) {
      this.renderer.insertBefore(hostParent, componentRef.location.nativeElement, this.renderer.nextSibling(hostEl))
    }
    componentRef.changeDetectorRef.detectChanges()
  }

  private renderChildren(parentEl: HTMLElement, children: MarkdownAstNode[], renderData: NodeRenderData): void {
    this.patchChildren(parentEl, [], children, renderData, this.node())
  }

  /**
   * Render `children` into `parentEl`, reusing `previous` entries matched by key in order. Entries
   * are never moved: a reordered or replaced child is created fresh before the next reused one.
   */
  private patchChildren(
    parentEl: HTMLElement,
    previous: RenderedChild[],
    children: MarkdownAstNode[],
    renderData: NodeRenderData,
    parentNode: MarkdownAstNode | undefined
  ): RenderedChild[] {
    const keys = getChildKeys(children)
    const byKey = new Map<string, number>()
    for (let i = 0; i < previous.length; i++) byKey.set(previous[i].key, i)

    const components = this.components()
    const transformNode = this.transformNode()
    const prepared: (PreparedNode | null)[] = new Array(children.length)
    const reused: (RenderedChild | null)[] = new Array(children.length)
    const kept = new Set<RenderedChild>()
    let lastIndex = -1

    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      reused[i] = null
      prepared[i] = null
      if (child === undefined || child === null) continue
      if (Array.isArray(child)) {
        if (!getTag(child)) continue
        prepared[i] = prepareNode(child as ElementNode, components, renderData, parentNode, transformNode)
      }
      const index = byKey.get(keys[i])
      if (index === undefined || index <= lastIndex) continue
      const entry = previous[index]
      const next = prepared[i]
      const compatible =
        typeof child === 'string'
          ? entry.kind === 'text'
          : next!.customComponent
            ? entry.kind === 'component'
            : entry.kind === 'element' && entry.tag === next!.tag
      if (!compatible) continue
      reused[i] = entry
      kept.add(entry)
      lastIndex = index
    }

    for (const entry of previous) {
      if (kept.has(entry)) continue
      if (entry.kind === 'component') {
        entry.ref.destroy()
        continue
      }
      if (entry.kind === 'element') destroyComponents(entry.children)
      this.renderer.removeChild(parentEl, entry.dom)
    }

    const anchors: (Node | null)[] = new Array(children.length)
    let anchor: Node | null = null
    for (let i = children.length - 1; i >= 0; i--) {
      anchors[i] = anchor
      if (reused[i]) anchor = reused[i]!.dom
    }

    const out: RenderedChild[] = []
    for (let i = 0; i < children.length; i++) {
      const child = children[i]
      if (child === undefined || child === null) continue
      const entry = reused[i]
      const next = prepared[i]

      if (entry) {
        if (entry.kind === 'text') {
          if (entry.node !== child) entry.dom.data = child as string
          entry.node = child as string
        } else if (entry.kind === 'component') {
          if (
            entry.node === child &&
            entry.renderData === renderData &&
            (entry.parent === parentNode || !transformNode)
          ) {
            out.push(entry)
            continue
          }
          entry.node = child as ElementNode
          entry.renderData = renderData
          entry.parent = parentNode
          try {
            entry.ref.setInput('node', child)
            entry.ref.setInput('components', components)
            entry.ref.setInput('renderData', renderData)
            entry.ref.setInput('parent', parentNode)
            entry.ref.setInput('transformNode', transformNode)
            entry.ref.changeDetectorRef.detectChanges()
          } catch (error) {
            // Drop the failed component, as the creation path does, so the next update recreates it.
            entry.ref.destroy()
            console.error(`Failed to update custom component "${getTag(child)}"`, error)
            continue
          }
        } else if (entry.node !== child || entry.renderData !== next!.childrenRenderData) {
          this.patchElement(entry, child as ElementNode, next!)
        }
        out.push(entry)
        continue
      }

      const before = anchors[i]

      if (typeof child === 'string') {
        const text = this.renderer.createText(child)
        if (before) this.renderer.insertBefore(parentEl, text, before)
        else this.renderer.appendChild(parentEl, text)
        out.push({ kind: 'text', key: keys[i], node: child, dom: text })
        continue
      }

      if (!next) continue
      if (next.customComponent) {
        let componentRef: ComponentRef<MarkdownNode> | undefined
        try {
          componentRef = this.vcr.createComponent(MarkdownNode)
          componentRef.setInput('node', child)
          componentRef.setInput('components', components)
          componentRef.setInput('renderData', renderData)
          componentRef.setInput('parent', parentNode)
          componentRef.setInput('transformNode', transformNode)

          // Move the component's host element into the parent before change detection,
          // so the custom component it inserts lands next to it inside `parentEl`
          const nativeEl = componentRef.location.nativeElement as HTMLElement
          nativeEl.style.display = 'contents'
          if (before) this.renderer.insertBefore(parentEl, nativeEl, before)
          else this.renderer.appendChild(parentEl, nativeEl)
          componentRef.changeDetectorRef.detectChanges()
          out.push({
            kind: 'component',
            key: keys[i],
            node: child as ElementNode,
            ref: componentRef,
            dom: nativeEl,
            renderData,
            parent: parentNode,
          })
        } catch (error) {
          componentRef?.destroy()
          console.error(`Failed to render custom component "${getTag(child)}"`, error)
        }
        continue
      }

      out.push(
        this.renderNativeEl(
          parentEl,
          next.tag,
          next.props,
          getChildren(child),
          next.childrenRenderData,
          child,
          before,
          keys[i]
        )
      )
    }
    return out
  }
}

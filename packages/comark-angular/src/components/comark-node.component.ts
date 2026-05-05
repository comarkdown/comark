import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ViewContainerRef,
  ElementRef,
  Renderer2,
  OnChanges,
  SimpleChanges,
  Type,
  Injector,
  createComponent,
  reflectComponentType,
} from '@angular/core'
import type { ComarkElement, ComarkNode, NodeRenderData } from 'comark'
import { pascalCase, resolveAttributes } from 'comark/utils'

/**
 * Helper to get tag from a ComarkNode
 */
function getTag(node: ComarkNode): string | null {
  if (Array.isArray(node) && node.length >= 1) {
    return node[0] as string
  }
  return null
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

/**
 * Resolve a custom component from the components map.
 */
function resolveComponent(tag: string, components: Record<string, Type<any>>): Type<any> | undefined {
  const pascalTag = pascalCase(tag)
  const proseTag = `Prose${pascalTag}`
  return components[proseTag] || components[tag] || components[pascalTag]
}

/** Void (self-closing) HTML elements that must not have children. */
const VOID_ELEMENTS = new Set([
  'area',
  'base',
  'br',
  'col',
  'embed',
  'hr',
  'img',
  'input',
  'link',
  'meta',
  'param',
  'source',
  'track',
  'wbr',
])

/**
 * ComarkNode — recursive component that renders a single Comark AST node.
 *
 * For text nodes, it inserts the text directly.
 * For element nodes, it creates a native DOM element or instantiates
 * a custom Angular component via ViewContainerRef.
 */
@Component({
  selector: 'comark-node',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: '',
})
export class ComarkNodeComponent implements OnChanges {
  /** The Comark AST node to render */
  @Input({ required: true }) node!: ComarkNode

  /** Custom component mappings */
  @Input() components: Record<string, Type<any>> = {}

  /** Render data for :binding resolution */
  @Input() renderData: NodeRenderData = { frontmatter: {}, meta: {}, data: {}, props: {} }

  /** Parent node (for context like `pre` tag detection) */
  @Input() parent?: ComarkNode

  constructor(
    private vcr: ViewContainerRef,
    private renderer: Renderer2,
    private elementRef: ElementRef,
    private injector: Injector
  ) {}

  ngOnChanges(_changes: SimpleChanges): void {
    this.render()
  }

  private render(): void {
    this.vcr.clear()

    const hostEl = this.elementRef.nativeElement as HTMLElement
    // Clear previous content from the host
    while (hostEl.firstChild) {
      hostEl.removeChild(hostEl.firstChild)
    }

    if (this.node === undefined || this.node === null) return

    // Text node
    if (typeof this.node === 'string') {
      const text = this.renderer.createText(this.node)
      this.renderer.appendChild(hostEl, text)
      return
    }

    // Element node
    if (Array.isArray(this.node)) {
      const tag = getTag(this.node)
      if (!tag) return

      const nodeProps = getProps(this.node)
      const children = getChildren(this.node)

      // Resolve custom component
      let customComponent: Type<any> | undefined

      if ((this.parent as ComarkElement | undefined)?.[0] !== 'pre') {
        if (nodeProps.as) {
          customComponent = resolveComponent(nodeProps.as, this.components)
        }
        if (!customComponent) {
          customComponent = resolveComponent(tag, this.components)
        }
      }

      // Resolve attributes (:binding support)
      const resolved = resolveAttributes(nodeProps, this.renderData, { parseJson: true })

      // Build childrenRenderData — only shadow parent scope when element has own attrs
      const hasOwnAttrs = Object.keys(resolved).length > 0
      const childrenRenderData: NodeRenderData = hasOwnAttrs ? { ...this.renderData, props: resolved } : this.renderData

      if (customComponent) {
        this.renderCustomComponent(customComponent, resolved, children, childrenRenderData)
      } else {
        this.renderNativeElement(tag, resolved, children, childrenRenderData)
      }
    }
  }

  private renderNativeElement(
    tag: string,
    attrs: Record<string, any>,
    children: ComarkNode[],
    childrenRenderData: NodeRenderData
  ): void {
    const hostEl = this.elementRef.nativeElement as HTMLElement
    const el = this.renderer.createElement(tag)

    // Apply attributes
    for (const key in attrs) {
      const value = attrs[key]
      if (key === 'className' || key === 'class') {
        this.renderer.setAttribute(el, 'class', value)
      } else if (key === 'innerHTML' || key === 'dangerouslySetInnerHTML') {
        // handled after children
      } else if (typeof value === 'boolean') {
        if (value) {
          this.renderer.setAttribute(el, key, '')
        }
      } else if (value != null) {
        this.renderer.setAttribute(el, key, String(value))
      }
    }

    // Handle innerHTML (used by some plugins like math/mermaid)
    if (attrs['innerHTML'] != null) {
      el.innerHTML = attrs['innerHTML']
    } else if (!VOID_ELEMENTS.has(tag)) {
      // Render children
      this.renderChildren(el, children, childrenRenderData)
    }

    this.renderer.appendChild(hostEl, el)
  }

  private renderCustomComponent(
    componentType: Type<any>,
    attrs: Record<string, any>,
    children: ComarkNode[],
    childrenRenderData: NodeRenderData
  ): void {
    const hostEl = this.elementRef.nativeElement as HTMLElement

    // Separate slots from regular children
    const slots: Record<string, ComarkNode[]> = {}
    const regularChildren: ComarkNode[] = []

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

    // Pre-render children into a temporary container so we can pass them as projectableNodes for Angular's <ng-content /> content projection
    const tempContainer = this.renderer.createElement('div')

    // Render regular children
    if (regularChildren.length > 0) {
      this.renderChildren(tempContainer, regularChildren, childrenRenderData)
    }

    // Render named slot "default" children too
    if (slots['default']) {
      this.renderChildren(tempContainer, slots['default'], childrenRenderData)
    }

    // Collect all rendered child nodes for the default slot
    const defaultSlotNodes: Node[] = Array.from(tempContainer.childNodes)

    // Build projectableNodes array — index 0 is the default <ng-content />
    const projectableNodes: Node[][] = [defaultSlotNodes]

    // Create the Angular component with projected content
    const componentRef = createComponent(componentType, {
      environmentInjector: this.vcr.injector.get(Injector as any, this.injector) as any,
      elementInjector: this.injector,
      projectableNodes,
    })

    // Set inputs
    const mirror = reflectComponentType(componentType)
    const inputNames = new Set(mirror?.inputs.map((i) => i.propName) || [])

    for (const key in attrs) {
      if (key === 'as') continue
      if (inputNames.has(key)) {
        componentRef.setInput(key, attrs[key])
      }
    }

    // Pass __node if the component accepts it
    if (inputNames.has('__node')) {
      componentRef.setInput('__node', this.node)
    }

    // Render non-default named slots into the component's host element
    for (const slotName in slots) {
      if (slotName === 'default') continue
      const slotEl = this.renderer.createElement('div')
      this.renderer.setAttribute(slotEl, 'slot', slotName)
      this.renderer.setStyle(slotEl, 'display', 'contents')
      this.renderChildren(slotEl, slots[slotName], childrenRenderData)
      this.renderer.appendChild(componentRef.location.nativeElement, slotEl)
    }

    // Attach to DOM and detect changes
    this.vcr.insert(componentRef.hostView)
    componentRef.changeDetectorRef.detectChanges()
  }

  /**
   * Render an array of ComarkNode children into a parent DOM element.
   * Each child gets its own `comark-node` component created dynamically.
   */
  private renderChildren(parentEl: HTMLElement, children: ComarkNode[], renderData: NodeRenderData): void {
    for (const child of children) {
      if (child === undefined || child === null) continue

      // For text nodes, insert directly
      if (typeof child === 'string') {
        const text = this.renderer.createText(child)
        this.renderer.appendChild(parentEl, text)
        continue
      }

      // For element nodes, recursively create ComarkNodeComponent
      if (Array.isArray(child)) {
        const childTag = getTag(child)
        if (!childTag) continue

        const childProps = getProps(child)
        const grandChildren = getChildren(child)

        // Resolve custom component for this child
        let customComponent: Type<any> | undefined
        if ((this.node as ComarkElement)?.[0] !== 'pre') {
          if (childProps.as) {
            customComponent = resolveComponent(childProps.as, this.components)
          }
          if (!customComponent) {
            customComponent = resolveComponent(childTag, this.components)
          }
        }

        const resolved = resolveAttributes(childProps, renderData, { parseJson: true })
        const hasOwnAttrs = Object.keys(resolved).length > 0
        const childRenderData: NodeRenderData = hasOwnAttrs ? { ...renderData, props: resolved } : renderData

        if (customComponent) {
          // Create a host element for the dynamic component
          const hostEl = this.renderer.createElement('comark-node')
          this.renderer.setStyle(hostEl, 'display', 'contents')
          this.renderer.appendChild(parentEl, hostEl)

          const componentRef = this.vcr.createComponent(ComarkNodeComponent)
          componentRef.instance.node = child
          componentRef.instance.components = this.components
          componentRef.instance.renderData = renderData
          componentRef.instance.parent = this.node
          componentRef.changeDetectorRef.detectChanges()

          // Move the component's host element into the parent
          this.renderer.appendChild(parentEl, componentRef.location.nativeElement)
        } else {
          // Native element — render inline for performance
          const el = this.renderer.createElement(childTag)

          for (const key in resolved) {
            if (key === 'as') continue
            const value = resolved[key]
            if (key === 'className' || key === 'class') {
              this.renderer.setAttribute(el, 'class', String(value))
            } else if (key === 'innerHTML') {
              // handled below
            } else if (typeof value === 'boolean') {
              if (value) this.renderer.setAttribute(el, key, '')
            } else if (value != null) {
              this.renderer.setAttribute(el, key, String(value))
            }
          }

          if (resolved['innerHTML'] != null) {
            el.innerHTML = resolved['innerHTML']
          } else if (!VOID_ELEMENTS.has(childTag)) {
            this.renderChildren(el, grandChildren, childRenderData)
          }

          this.renderer.appendChild(parentEl, el)
        }
      }
    }
  }
}

import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Type,
  inject,
  type OnInit,
  type OnDestroy,
  input,
} from '@angular/core'
import type { Node, MarkdownDocument as MarkdownDocumentType, NodeRenderData, NodeTransform } from 'comark'
import { createStreamRenderer, getChildKeys, resolveStreamEffects } from 'comark/stream'
import type { CaretOptions, FadeOptions, StreamEffect } from 'comark/stream'
import { MarkdownNode, isSameValue } from './markdown-node.component'

const EMPTY_DOCUMENT: MarkdownDocumentType = { nodes: [], frontmatter: {}, meta: {} }

interface RenderedNode {
  key: string
  node: Node
}

/**
 * MarkdownDocument component
 *
 * Renders an already-parsed Markdown document to Angular components/HTML, keeping
 * the parser out of the client bundle. Supports custom component mapping for
 * element tags.
 *
 * @example
 * ```html
 * <comark-markdown-document [value]="document" [components]="customComponents" />
 * ```
 */
@Component({
  selector: 'comark-markdown-document',
  standalone: true,
  imports: [MarkdownNode],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="comark-content">
      @for (entry of renderedNodes; track entry.key) {
        <comark-markdown-node
          [node]="entry.node"
          [components]="components()"
          [renderData]="renderData"
          [transformNode]="transformNode()"
        />
      }
    </div>
  `,
})
export class MarkdownDocument implements OnInit, OnDestroy {
  /** The parsed Markdown document to render */
  readonly value = input<MarkdownDocumentType>()

  /** Custom component mappings for element tags */
  readonly components = input<Record<string, Type<any>>>({})

  /** Enable streaming mode */
  readonly streaming = input<boolean>(false)

  /** Append a caret to the last text node (for streaming UIs) */
  readonly caret = input<boolean | CaretOptions>(false)

  /** Fade in text as it streams */
  readonly fade = input<boolean | FadeOptions>(false)

  /** Custom render-time stream effects. They run first, then `fade`, then `caret`. Put `pace()` first. */
  readonly effects = input<readonly StreamEffect[]>()

  /** Additional data to pass to the renderer for :binding resolution */
  readonly data = input<Record<string, unknown>>({})

  /** Change the tag or props of element nodes just before they render */
  readonly transformNode = input<NodeTransform | readonly NodeTransform[]>()

  /**
   * Document key used to subscribe to live updates via `globalThis.comarkContext`.
   * Falls back to the document's own `meta.key` when set by a plugin.
   */
  readonly documentKey = input<string>()

  private cdr = inject(ChangeDetectorRef)
  private liveDocument: MarkdownDocumentType | null = null
  private cleanup?: (clear?: boolean) => void
  private stream = createStreamRenderer()
  private frameId: number | null = null
  private renderCache: { inputs: unknown[]; nodes: RenderedNode[] } | null = null
  private renderDataCache: { inputs: unknown[]; data: unknown; value: NodeRenderData } | null = null

  private get inputDocument(): MarkdownDocumentType {
    return this.value() ?? EMPTY_DOCUMENT
  }

  ngOnInit(): void {
    const key = this.inputDocument.meta?.key || this.documentKey()
    if (key && globalThis.comarkContext) {
      this.cleanup = globalThis.comarkContext.get(key, this.inputDocument).listen((document) => {
        this.liveDocument = document
        this.cdr.markForCheck()
      })
    }
  }

  ngOnDestroy(): void {
    this.cleanup?.(true)
    if (this.frameId !== null) cancelAnimationFrame(this.frameId)
  }

  private get activeDocument(): MarkdownDocumentType {
    return this.liveDocument ?? this.inputDocument
  }

  // Getters run on every change detection pass: cache on input identity so stream effects only
  // advance (and children only re-render) when an input actually changed.
  get renderedNodes(): RenderedNode[] {
    const inputs = [this.activeDocument, this.streaming(), this.caret(), this.fade(), this.effects()]
    if (this.renderCache && sameInputs(this.renderCache.inputs, inputs)) {
      this.scheduleFrame()
      return this.renderCache.nodes
    }

    const nodes = this.stream.render(this.activeDocument.nodes || [], {
      streaming: this.streaming(),
      effects: resolveStreamEffects({ caret: this.caret(), fade: this.fade(), effects: this.effects() }),
    })
    const keys = getChildKeys(nodes)
    const rendered = nodes.map((node, i) => ({ key: keys[i], node }))
    this.renderCache = { inputs, nodes: rendered }
    this.scheduleFrame()
    return rendered
  }

  // Paced effects release text on a clock, so keep re-rendering until their backlog is empty.
  private scheduleFrame(): void {
    if (this.frameId !== null || !this.stream.pending() || typeof requestAnimationFrame !== 'function') return
    this.frameId = requestAnimationFrame(() => {
      this.frameId = null
      this.renderCache = null
      this.cdr.markForCheck()
    })
  }

  get renderData(): NodeRenderData {
    const document = this.activeDocument
    const inputs = [document.frontmatter, document.meta]
    const data = this.data()
    // Streaming parses return fresh (usually equal) `meta`/`frontmatter` objects every chunk; keeping
    // the same render data lets unchanged custom components skip re-rendering.
    const cache = this.renderDataCache
    if (cache && cache.data === data && isSameValue(cache.inputs, inputs)) return cache.value

    const value = {
      frontmatter: document.frontmatter,
      meta: document.meta,
      data: data || {},
      props: {},
    }
    this.renderDataCache = { inputs, data, value }
    return value
  }
}

function sameInputs(a: unknown[], b: unknown[]): boolean {
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false
  return true
}

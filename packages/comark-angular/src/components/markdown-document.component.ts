import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Type,
  inject,
  type OnInit,
  type OnDestroy,
} from '@angular/core'
import type { ElementNode, Node, MarkdownDocument as MarkdownDocumentType, NodeRenderData } from 'comark'
import type { ComarkModel } from 'comark/model'
import { createModelStore } from 'comark/model'
import { MarkdownNode } from './markdown-node.component.ts'
import { findLastTextNodeAndAppendNode, getCaret } from '../utils/caret.ts'

const EMPTY_DOCUMENT: MarkdownDocumentType = { nodes: [], frontmatter: {}, meta: {} }

/**
 * MarkdownDocument component
 *
 * Renders an already-parsed Markdown document to Angular components/HTML — no
 * parser in the client bundle. Supports custom component mapping for
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
      @for (node of renderedNodes; track $index) {
        <comark-markdown-node
          [node]="node"
          [components]="components"
          [renderData]="renderData"
          [model]="activeModel"
        />
      }
    </div>
  `,
})
export class MarkdownDocument implements OnInit, OnDestroy {
  /** The parsed Markdown document to render */
  @Input() value?: MarkdownDocumentType

  /** Custom component mappings for element tags */
  @Input() components: Record<string, Type<any>> = {}

  /** Enable streaming mode */
  @Input() streaming: boolean = false

  /** Append a caret to the last text node (for streaming UIs) */
  @Input() caret: boolean | { class: string } = false

  /** Additional data to pass to the renderer for :binding resolution */
  @Input() data: Record<string, unknown> = {}

  /**
   * Two-way data binding model. When provided, `::prop="path"` attributes are
   * resolved against the model and update handlers are wired automatically.
   * When omitted an internal uncontrolled store is created from `data`.
   */
  @Input() model?: ComarkModel

  /** Called after every write accepted by the model. */
  @Input() onModelChange?: (path: string, value: unknown, snapshot: Record<string, unknown>) => void

  /**
   * Document key used to subscribe to live updates via `globalThis.comarkContext`.
   * Falls back to the document's own `meta.key` when set by a plugin.
   */
  @Input() documentKey?: string

  private cdr = inject(ChangeDetectorRef)
  private liveDocument: MarkdownDocumentType | null = null
  private cleanup?: (clear?: boolean) => void
  private modelCleanup?: () => void
  private internalModel?: ComarkModel

  private get inputDocument(): MarkdownDocumentType {
    return this.value ?? EMPTY_DOCUMENT
  }

  // Live document support: if an ambient context exists, subscribe to updates
  // for this key and re-render with the pushed document. Cleaned up on destroy.
  ngOnInit(): void {
    const key = this.inputDocument.meta?.key || this.documentKey
    if (key && globalThis.comarkContext) {
      this.cleanup = globalThis.comarkContext.get(key, this.inputDocument).listen((document) => {
        this.liveDocument = document
        this.cdr.markForCheck()
      })
    }

    // Model boundary: create an uncontrolled store if no model is provided.
    // Subscribe to 'data' so every write triggers change detection.
    this.internalModel =
      this.model ??
      createModelStore({
        data: { data: this.data ?? {} },
        onChange: this.onModelChange,
      })
    this.modelCleanup = this.internalModel.subscribe('data', () => {
      this.cdr.markForCheck()
    })
  }

  ngOnDestroy(): void {
    this.cleanup?.(true)
    this.modelCleanup?.()
  }

  get activeModel(): ComarkModel | undefined {
    return this.internalModel
  }

  private get activeDocument(): MarkdownDocumentType {
    return this.liveDocument ?? this.inputDocument
  }

  get renderedNodes(): Node[] {
    const nodes = [...(this.activeDocument.nodes || [])]
    const caretNode = getCaret(this.caret)

    if (this.streaming && caretNode && nodes.length > 0) {
      const hasStreamCaret = findLastTextNodeAndAppendNode(nodes[nodes.length - 1] as ElementNode, caretNode)
      if (!hasStreamCaret) {
        nodes.push(caretNode)
      }
    }

    return nodes
  }

  get renderData(): NodeRenderData {
    return {
      frontmatter: this.activeDocument.frontmatter,
      meta: this.activeDocument.meta,
      data: this.data || {},
      props: {},
      model: this.internalModel,
    }
  }
}

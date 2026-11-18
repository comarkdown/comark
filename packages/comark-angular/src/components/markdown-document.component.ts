import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Type,
  computed,
  inject,
  type OnInit,
  type OnDestroy,
  input,
} from '@angular/core'
import type { ElementNode, Node, MarkdownDocument as MarkdownDocumentType, NodeRenderData, NodeTransform } from 'comark'
import { mergeNodeTransforms } from 'comark/utils'
import { MARKDOWN_DOCUMENT_CONFIG } from '../config'
import type { MarkdownDocumentConfig } from '../config'
import { MarkdownNode } from './markdown-node.component'
import { findLastTextNodeAndAppendNode, getCaret } from '../utils/caret'

const EMPTY_DOCUMENT: MarkdownDocumentType = { nodes: [], frontmatter: {}, meta: {} }

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
  host: {
    '[class]': 'config?.class ?? ""',
  },
  template: `
    <div class="comark-content">
      @for (node of renderedNodes; track $index) {
        <comark-markdown-node
          [node]="node"
          [components]="mergedComponents()"
          [renderData]="renderData"
          [transformNode]="mergedTransforms()"
        />
      }
    </div>
  `,
})
export class MarkdownDocument implements OnInit, OnDestroy {
  protected readonly config: MarkdownDocumentConfig | null = inject(MARKDOWN_DOCUMENT_CONFIG, { optional: true })

  /** The parsed Markdown document to render */
  readonly value = input<MarkdownDocumentType>()

  /** Custom component mappings for element tags */
  readonly components = input<Record<string, Type<any>>>({})

  /** Enable streaming mode */
  readonly streaming = input<boolean>(false)

  /** Append a caret to the last text node (for streaming UIs) */
  readonly caret = input<boolean | { class: string }>(false)

  /** Additional data to pass to the renderer for :binding resolution */
  readonly data = input<Record<string, unknown>>({})

  /** Change the tag or props of element nodes just before they render */
  readonly transformNode = input<NodeTransform | readonly NodeTransform[]>()

  /** Config-level and instance-level components merged, instance wins. */
  protected readonly mergedComponents = computed(() => ({ ...(this.config?.components ?? {}), ...this.components() }))

  /** Config-level transforms run before the instance's own transforms. */
  protected readonly mergedTransforms = computed(() =>
    mergeNodeTransforms(this.config?.transformNode, this.transformNode())
  )

  /**
   * Document key used to subscribe to live updates via `globalThis.comarkContext`.
   * Falls back to the document's own `meta.key` when set by a plugin.
   */
  readonly documentKey = input<string>()

  private cdr = inject(ChangeDetectorRef)
  private liveDocument: MarkdownDocumentType | null = null
  private cleanup?: (clear?: boolean) => void

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
  }

  private get activeDocument(): MarkdownDocumentType {
    return this.liveDocument ?? this.inputDocument
  }

  get renderedNodes(): Node[] {
    const nodes = [...(this.activeDocument.nodes || [])]
    const caretNode = getCaret(this.caret())

    if (this.streaming() && caretNode && nodes.length > 0) {
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
      data: this.data() || {},
      props: {},
    }
  }
}

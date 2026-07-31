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
import { MarkdownNode } from './markdown-node.component.ts'
import { findLastTextNodeAndAppendNode, getCaret } from '../utils/caret.ts'
import { warnDeprecated } from '../internal/deprecation.ts'

const EMPTY_TREE: MarkdownDocumentType = { nodes: [], frontmatter: {}, meta: {} }

/**
 * MarkdownDocument component
 *
 * Renders an already-parsed Comark tree to Angular components/HTML — no
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
        />
      }
    </div>
  `,
})
export class MarkdownDocument implements OnInit, OnDestroy {
  /** The parsed Comark tree to render */
  @Input() value?: MarkdownDocumentType

  /**
   * The parsed Comark tree to render
   * @deprecated Use `value` instead
   */
  @Input() tree?: MarkdownDocumentType

  /** Custom component mappings for element tags */
  @Input() components: Record<string, Type<any>> = {}

  /** Enable streaming mode */
  @Input() streaming: boolean = false

  /** Append a caret to the last text node (for streaming UIs) */
  @Input() caret: boolean | { class: string } = false

  /** Additional data to pass to the renderer for :binding resolution */
  @Input() data: Record<string, unknown> = {}

  /**
   * Document key used to subscribe to live updates via `globalThis.comarkContext`.
   * Falls back to the tree's own `meta.key` when set by a plugin.
   */
  @Input() comarkKey?: string

  private cdr = inject(ChangeDetectorRef)
  private liveTree: MarkdownDocumentType | null = null
  private cleanup?: (clear?: boolean) => void

  private get inputTree(): MarkdownDocumentType {
    return this.value ?? this.tree ?? EMPTY_TREE
  }

  // Live document support: if an ambient context exists, subscribe to updates
  // for this key and re-render with the pushed tree. Cleaned up on destroy.
  ngOnInit(): void {
    if (this.tree !== undefined && this.value === undefined) {
      warnDeprecated('tree (input)', 'value')
    }
    const key = this.inputTree.meta?.key || this.comarkKey
    if (key && globalThis.comarkContext) {
      this.cleanup = globalThis.comarkContext.get(key, this.inputTree).listen((tree) => {
        this.liveTree = tree
        this.cdr.markForCheck()
      })
    }
  }

  ngOnDestroy(): void {
    this.cleanup?.(true)
  }

  private get activeTree(): MarkdownDocumentType {
    return this.liveTree ?? this.inputTree
  }

  get renderedNodes(): Node[] {
    const nodes = [...(this.activeTree.nodes || [])]
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
      frontmatter: this.activeTree.frontmatter,
      meta: this.activeTree.meta,
      data: this.data || {},
      props: {},
    }
  }
}

/**
 * @deprecated Use `MarkdownDocument` instead — same component, renamed to
 * describe what it renders. `ComarkRendererComponent` (selector
 * `comark-renderer`) will be removed in a future major version.
 */
@Component({
  selector: 'comark-renderer',
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
        />
      }
    </div>
  `,
})
export class ComarkRendererComponent extends MarkdownDocument {
  override ngOnInit(): void {
    warnDeprecated('ComarkRendererComponent (<comark-renderer>)', 'MarkdownDocument (<comark-markdown-document>)')
    super.ngOnInit()
  }
}

/**
 * @deprecated Use `MarkdownDocument` instead — same component, renamed from `MarkdownParsed`.
 * Selector `comark-markdown-parsed` will be removed in a future major version.
 */
@Component({
  selector: 'comark-markdown-parsed',
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
        />
      }
    </div>
  `,
})
export class MarkdownParsed extends MarkdownDocument {
  override ngOnInit(): void {
    warnDeprecated('MarkdownParsed (<comark-markdown-parsed>)', 'MarkdownDocument (<comark-markdown-document>)')
    super.ngOnInit()
  }
}

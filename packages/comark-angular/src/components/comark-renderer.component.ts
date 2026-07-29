import {
  Component,
  Input,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  OnChanges,
  OnDestroy,
  OnInit,
  SimpleChanges,
  Type,
  inject,
} from '@angular/core'
import {
  subscribeComarkDocument,
  type ComarkDocumentSubscription,
  type ComarkElement,
  type ComarkNode,
  type ComarkTree,
  type NodeRenderData,
} from 'comark'
import { ComarkNodeComponent } from './comark-node.component.ts'
import { findLastTextNodeAndAppendNode, getCaret } from '../utils/caret.ts'

/**
 * ComarkRenderer component
 *
 * Renders a pre-parsed Comark tree to Angular components/HTML.
 * Supports custom component mapping for element tags.
 *
 * @example
 * ```html
 * <comark-renderer [tree]="parsedTree" [components]="customComponents" />
 * ```
 */
@Component({
  selector: 'comark-renderer',
  standalone: true,
  imports: [ComarkNodeComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="comark-content">
      @for (node of renderedNodes; track $index) {
        <comark-node
          [node]="node"
          [components]="components"
          [renderData]="renderData"
        />
      }
    </div>
  `,
})
export class ComarkRendererComponent implements OnInit, OnChanges, OnDestroy {
  /** The Comark tree to render */
  @Input({ required: true }) tree!: ComarkTree

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
   * When a context exists but no key is provided, an auto id is allocated so the
   * instance still appears in Vite DevTools.
   */
  @Input() comarkKey?: string

  private cdr = inject(ChangeDetectorRef)
  private liveTree: ComarkTree | null = null
  private subscription: ComarkDocumentSubscription | null = null

  // Live document support via ambient context (auto-id when DevTools is present).
  ngOnInit(): void {
    this.subscription = subscribeComarkDocument(this.tree, this.comarkKey, (tree) => {
      this.liveTree = tree
      this.cdr.markForCheck()
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Keep the context document in sync when the parent re-parses.
    if (changes['tree'] && !changes['tree'].firstChange) {
      this.subscription?.set(this.tree)
    }
  }

  ngOnDestroy(): void {
    this.subscription?.cleanup(true)
    this.subscription = null
  }

  private get activeTree(): ComarkTree {
    return this.liveTree ?? this.tree
  }

  get renderedNodes(): ComarkNode[] {
    const nodes = [...(this.activeTree.nodes || [])]
    const caretNode = getCaret(this.caret)

    if (this.streaming && caretNode && nodes.length > 0) {
      const hasStreamCaret = findLastTextNodeAndAppendNode(nodes[nodes.length - 1] as ComarkElement, caretNode)
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

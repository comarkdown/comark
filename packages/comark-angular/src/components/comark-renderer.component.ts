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
import type { ComarkElement, ComarkNode, ComarkTree, NodeRenderData } from 'comark'
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
export class ComarkRendererComponent implements OnInit, OnDestroy {
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
   */
  @Input() comarkKey?: string

  private cdr = inject(ChangeDetectorRef)
  private liveTree: ComarkTree | null = null
  private cleanup?: (clear?: boolean) => void

  // Live document support: if an ambient context exists, subscribe to updates
  // for this key and re-render with the pushed tree. Cleaned up on destroy.
  ngOnInit(): void {
    const key = this.tree.meta?.key || this.comarkKey
    if (key && globalThis.comarkContext) {
      this.cleanup = globalThis.comarkContext.get(key, this.tree).listen((tree) => {
        this.liveTree = tree
        this.cdr.markForCheck()
      })
    }
  }

  ngOnDestroy(): void {
    this.cleanup?.(true)
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

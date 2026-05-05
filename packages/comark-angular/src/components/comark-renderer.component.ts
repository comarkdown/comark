import { Component, Input, ChangeDetectionStrategy, Type } from '@angular/core'
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
export class ComarkRendererComponent {
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

  get renderedNodes(): ComarkNode[] {
    const nodes = [...(this.tree.nodes || [])]
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
      frontmatter: this.tree.frontmatter,
      meta: this.tree.meta,
      data: this.data || {},
      props: {},
    }
  }
}

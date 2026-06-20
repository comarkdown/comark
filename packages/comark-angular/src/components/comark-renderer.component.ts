import { Component, Input, ChangeDetectionStrategy, ChangeDetectorRef, OnChanges, OnDestroy, OnInit, SimpleChanges, Type } from '@angular/core'
import type { ComarkElement, ComarkNode, ComarkTree, NodeRenderData } from 'comark'
import type { RegisteredInstance } from 'comark/devtools'
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

  private devtoolsHandle: RegisteredInstance | null = null
  private devtoolsDisposed = false

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnInit(): void {
    const hot = (import.meta as Record<string, any>).hot
    if (!hot) return

    import('comark/devtools').then(({ registerDevtoolsInstanceFromTree }) => {
      if (this.devtoolsDisposed) return
      registerDevtoolsInstanceFromTree({
        hot,
        tree: this.tree,
        onUpdate: (_newMarkdown, newTree) => {
          if (newTree) {
            this.tree = newTree
            this.cdr.markForCheck()
          }
        },
      }).then((handle) => {
        if (this.devtoolsDisposed) { handle?.unregister(); return }
        this.devtoolsHandle = handle
      })
    })
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tree'] && !changes['tree'].firstChange && this.devtoolsHandle) {
      import('comark/render').then(({ renderMarkdown }) => {
        renderMarkdown(this.tree).then((md) => {
          this.devtoolsHandle?.update({ tree: this.tree, markdown: md })
        })
      })
    }
  }

  ngOnDestroy(): void {
    this.devtoolsDisposed = true
    this.devtoolsHandle?.unregister()
  }

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

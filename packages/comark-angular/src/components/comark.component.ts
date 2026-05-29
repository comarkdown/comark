import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Type,
} from '@angular/core'
import { createSerializedParse } from 'comark'
import type { ParseOptions, ComarkTree } from 'comark'
import { ComarkRendererComponent } from './comark-renderer.component.ts'

/**
 * High-level Comark component that accepts raw markdown, parses it,
 * and renders the resulting AST.
 *
 * @example
 * ```html
 * <comark [markdown]="content" [components]="customComponents" />
 * ```
 */
@Component({
  selector: 'comark',
  standalone: true,
  imports: [ComarkRendererComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tree) {
      <comark-renderer
        [tree]="tree"
        [components]="components"
        [streaming]="streaming"
        [caret]="caret"
        [data]="data"
      />
    }
  `,
})
export class ComarkComponent implements OnChanges {
  /** The markdown content to parse and render */
  @Input() markdown: string = ''

  /** Parser options (excluding plugins) */
  @Input() options: Exclude<ParseOptions, 'plugins'> = {}

  /** Additional plugins to use */
  @Input() plugins: ParseOptions['plugins'] = []

  /** Custom component mappings for element tags */
  @Input() components: Record<string, Type<any>> = {}

  /** Enable streaming mode */
  @Input() streaming: boolean = false

  /** If document has a <!-- more --> comment, only render content before it */
  @Input() summary: boolean = false

  /** Append a caret to the last text node (for streaming UIs) */
  @Input() caret: boolean | { class: string } = false

  /** Additional data to pass to the renderer for :binding resolution */
  @Input() data: Record<string, unknown> = {}

  tree: ComarkTree | null = null

  private serializedParse = createSerializedParse({})

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['options'] || changes['plugins']) {
      this.serializedParse = createSerializedParse({ ...this.options, plugins: this.plugins })
    }
    if (changes['markdown'] || changes['options'] || changes['plugins'] || changes['streaming'] || changes['summary']) {
      this.parseMarkdown()
    }
  }

  private parseMarkdown(): void {
    let source = this.markdown || ''
    if (this.summary) {
      source = source.split('<!-- more -->')[0] || ''
    }
    source = source.trim()

    this.serializedParse(source, { streaming: this.streaming }).then((result) => {
      this.tree = result
      this.cdr.markForCheck()
    })
  }
}

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
import type { ParseOptions, MarkdownTree } from 'comark'
import { MarkdownParsed } from './markdown-parsed.component.ts'
import { warnDeprecated } from '../internal/deprecation.ts'

/**
 * High-level Markdown component that accepts raw markdown, parses it,
 * and renders the resulting AST.
 *
 * @example
 * ```html
 * <comark-markdown [value]="content" [components]="customComponents" />
 * ```
 */
@Component({
  selector: 'comark-markdown',
  standalone: true,
  imports: [MarkdownParsed],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tree) {
      <comark-markdown-parsed
        [value]="tree"
        [components]="components"
        [streaming]="streaming"
        [caret]="caret"
        [data]="data"
      />
    }
  `,
})
export class Markdown implements OnChanges {
  /** The markdown content to parse and render */
  @Input() value?: string

  /**
   * The markdown content to parse and render
   * @deprecated Use `value` instead
   */
  @Input() markdown?: string

  /** Parser options (excluding plugins) */
  @Input() options: Exclude<ParseOptions, 'plugins'> = {}

  /** Additional plugins to use */
  @Input() plugins: ParseOptions['plugins'] = []

  /**
   * Strip wrapper tags from the top level of the tree — shorthand for
   * `options.unwrap`. `true` unwraps `<p>`; a space-separated string or array
   * unwraps the listed tags.
   */
  @Input() unwrap: boolean | string | string[] = false

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

  tree: MarkdownTree | null = null

  private serializedParse = createSerializedParse({})

  constructor(private cdr: ChangeDetectorRef) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['markdown'] && this.markdown !== undefined && this.value === undefined) {
      warnDeprecated('markdown (input)', 'value')
    }
    if (changes['options'] || changes['plugins'] || changes['unwrap']) {
      this.serializedParse = createSerializedParse({
        ...this.options,
        ...(this.unwrap ? { unwrap: this.unwrap } : {}),
        plugins: this.plugins,
      })
    }
    if (
      changes['value'] ||
      changes['markdown'] ||
      changes['options'] ||
      changes['plugins'] ||
      changes['unwrap'] ||
      changes['streaming'] ||
      changes['summary']
    ) {
      this.parseMarkdown()
    }
  }

  private parseMarkdown(): void {
    let source = this.value ?? this.markdown ?? ''
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

/**
 * @deprecated Use `Markdown` instead — same component, renamed to describe
 * what it renders. `ComarkComponent` (selector `comark`) will be removed in
 * a future major version.
 */
@Component({
  selector: 'comark',
  standalone: true,
  imports: [MarkdownParsed],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (tree) {
      <comark-markdown-parsed
        [value]="tree"
        [components]="components"
        [streaming]="streaming"
        [caret]="caret"
        [data]="data"
      />
    }
  `,
})
export class ComarkComponent extends Markdown {
  override ngOnChanges(changes: SimpleChanges): void {
    warnDeprecated('ComarkComponent (<comark>)', 'Markdown (<comark-markdown>)')
    super.ngOnChanges(changes)
  }
}

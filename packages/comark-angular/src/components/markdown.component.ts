import {
  Component,
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Type,
  inject,
  input,
  computed,
  effect,
  model,
} from '@angular/core'
import { createSerializedMarkdownParser } from 'comark'
import type { ParserOptions, MarkdownDocument as MarkdownDocumentType, NodeTransform } from 'comark'
import { isMarkdownDocument } from 'comark/utils'
import { MarkdownDocument } from './markdown-document.component'

/**
 * High-level Markdown component that accepts raw markdown, parses it,
 * and renders the resulting document.
 *
 * @example
 * ```html
 * <comark-markdown [value]="content" [components]="customComponents" />
 * ```
 */
@Component({
  selector: 'comark-markdown',
  standalone: true,
  imports: [MarkdownDocument],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (document) {
      <comark-markdown-document
        [value]="document"
        [components]="components()"
        [streaming]="streaming()"
        [caret]="caret()"
        [data]="data()"
        [transformNode]="transformNode()"
      />
    }
  `,
})
export class Markdown {
  /** The markdown content to parse and render, or a pre-parsed MarkdownDocument */
  readonly value = input<string | MarkdownDocumentType>()

  /** Parser options (excluding plugins) */
  readonly options = model<Omit<ParserOptions, 'plugins'>>({})

  /** Additional plugins to use */
  readonly plugins = model<ParserOptions['plugins']>([])

  /**
   * Strip wrapper tags from the top level of the document — shorthand for
   * `options.unwrap`. `true` unwraps `<p>`; a space-separated string or array
   * unwraps the listed tags.
   */
  readonly unwrap = input<boolean | string | string[]>(false)

  /** Custom component mappings for element tags */
  readonly components = input<Record<string, Type<any>>>({})

  /** Enable streaming mode */
  readonly streaming = input<boolean>(false)

  /** If document has a <!-- more --> comment, only render content before it */
  readonly summary = input<boolean>(false)

  /** Append a caret to the last text node (for streaming UIs) */
  readonly caret = input<boolean | { class: string }>(false)

  /** Additional data to pass to the renderer for :binding resolution */
  readonly data = input<Record<string, unknown>>({})

  /** Change the tag or props of element nodes just before they render */
  readonly transformNode = input<NodeTransform | readonly NodeTransform[]>()

  document: MarkdownDocumentType | null = null

  private cdr = inject(ChangeDetectorRef)

  /**
   * Compose the parse options consumed by the serialized parser.
   *
   * Subclasses (e.g. `defineMarkdownComponent`) override this to merge
   * config-level defaults without mutating the `options`/`plugins` inputs.
   */
  protected getParserOptions(): ParserOptions {
    return {
      ...this.options(),
      ...(this.unwrap() ? { unwrap: this.unwrap() } : {}),
      plugins: this.plugins(),
    }
  }

  /**
   * Serialized parser derived from the parser options. Recomputed whenever
   * `options`, `plugins`, `unwrap` (or any signal read by a subclass's
   * `getParserOptions()` override) changes.
   */
  private readonly serializedParse = computed(() => createSerializedMarkdownParser(this.getParserOptions()))

  /** Incremented on each parse so stale async results can be discarded. */
  private parseId = 0

  private readonly parseMarkdownEffect = effect(() => {
    const value = this.value()
    const id = ++this.parseId
    if (value === undefined || value === null) {
      this.document = null
      return
    }

    // Pre-parsed document — skip parsing and render directly
    if (isMarkdownDocument(value)) {
      this.document = value
      this.cdr.markForCheck()
      return
    }

    let source = value
    if (this.summary()) {
      source = source.split('<!-- more -->')[0] || ''
    }
    source = source.trim()

    const parse = this.serializedParse()
    parse(source, { streaming: this.streaming() }).then((result) => {
      if (id !== this.parseId) return
      this.document = result
      this.cdr.markForCheck()
    })
  })
}

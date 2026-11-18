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
import { isMarkdownDocument, mergeNodeTransforms } from 'comark/utils'
import { MARKDOWN_CONFIG } from '../config'
import type { MarkdownConfig } from '../config'
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
  host: {
    '[class]': 'config?.class ?? ""',
  },
  template: `
    @if (document) {
      <comark-markdown-document
        [value]="document"
        [components]="mergedComponents()"
        [streaming]="streaming()"
        [caret]="caret()"
        [data]="data()"
        [transformNode]="mergedTransforms()"
      />
    }
  `,
})
export class Markdown {
  protected readonly config: MarkdownConfig | null = inject(MARKDOWN_CONFIG, { optional: true })

  /** The markdown content to parse and render, or a pre-parsed MarkdownDocument */
  readonly value = input<string | MarkdownDocumentType>()

  /** Parser options (excluding plugins) */
  readonly options = model<Omit<ParserOptions, 'plugins'>>({})

  /** Additional plugins to use */
  readonly plugins = model<ParserOptions['plugins']>([])

  /**
   * Strip wrapper tags from the top level of the document. Shorthand for
   * `options.unwrap`. `true` unwraps `<p>`; a space-separated string or array
   * unwraps the listed tags.
   */
  readonly unwrap = input<boolean | string | string[]>()

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

  /** Config-level and instance-level components merged, instance wins. */
  protected readonly mergedComponents = computed(() => ({ ...(this.config?.components ?? {}), ...this.components() }))

  /** Config-level transforms run before the instance's own transforms. */
  protected readonly mergedTransforms = computed(() =>
    mergeNodeTransforms(this.config?.transformNode, this.transformNode())
  )

  document: MarkdownDocumentType | null = null

  private cdr = inject(ChangeDetectorRef)

  /**
   * Compose the parse options consumed by the serialized parser.
   *
   * Config defaults are merged under the instance inputs so instance values
   * win without mutating the input signals. Instance plugins replace config
   * plugins with the same name. An omitted `unwrap` inherits the config
   * default, while an explicit `false` overrides it.
   */
  protected getParserOptions(): ParserOptions {
    const plugins = new Map<string, NonNullable<ParserOptions['plugins']>[number]>()

    for (const plugin of this.config?.plugins ?? []) {
      plugins.set(plugin.name, plugin)
    }
    for (const plugin of this.plugins() ?? []) {
      plugins.delete(plugin.name)
      plugins.set(plugin.name, plugin)
    }

    const unwrap = this.unwrap()
    return {
      ...(this.config?.options ?? {}),
      ...this.options(),
      ...(unwrap === undefined ? {} : { unwrap }),
      plugins: [...plugins.values()],
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

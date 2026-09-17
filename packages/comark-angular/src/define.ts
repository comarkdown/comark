import { Component, ChangeDetectionStrategy, Type, input, computed } from '@angular/core'
import type { ParserOptions } from 'comark'
import { Markdown } from './components/markdown.component'
import { MarkdownDocument } from './components/markdown-document.component'

export interface DefineMarkdownComponentOptions extends ParserOptions {
  /** Pre-configured component mappings. */
  components?: Record<string, Type<any>>
  /** Additional CSS class for the wrapper. */
  class?: string
}

export interface DefineMarkdownDocumentOptions {
  /** Pre-configured component mappings. */
  components?: Record<string, Type<any>>
  /** Additional CSS class for the wrapper. */
  class?: string
}

/**
 * Create a pre-configured Markdown component with default options, plugins, and components.
 *
 * The returned class extends `Markdown` and merges the config-level
 * defaults with any per-instance `@Input()` values at runtime.
 *
 * @example
 * ```typescript
 * import { defineMarkdownComponent } from '@comark/angular'
 * import { math, Math } from '@comark/angular/plugins/math'
 *
 * export const DocsMarkdown = defineMarkdownComponent({
 *   plugins: [math()],
 *   components: { Math },
 *   class: 'prose dark:prose-invert',
 * })
 * ```
 */
export function defineMarkdownComponent(config: DefineMarkdownComponentOptions = {}): Type<Markdown> {
  const { components: configComponents = {}, class: configClass, plugins: configPlugins = [], ...parseOptions } = config

  @Component({
    selector: 'comark-markdown-defined',
    standalone: true,
    imports: [MarkdownDocument],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      @if (document) {
        <comark-markdown-document
          [value]="document"
          [components]="mergedComponents()"
          [streaming]="streaming()"
          [caret]="caret()"
          [data]="data()"
        />
      }
    `,
    host: {
      '[class]': 'hostClass',
    },
  })
  class DefinedMarkdownComponent extends Markdown {
    /** Instance-level components that are merged with config-level components. */
    // @Input() override components: Record<string, Type<any>> = {}
    override readonly components = input<Record<string, Type<any>>>({})

    protected readonly mergedComponents = computed(() => ({ ...configComponents, ...this.components() }))

    get hostClass(): string {
      return configClass || ''
    }

    /**
     * Effective plugins: config-level plugins first, then instance plugins,
     * deduplicated by plugin name so a plugin supplied by both runs once.
     */
    private readonly effectivePlugins = computed<ParserOptions['plugins']>(() => {
      const names = new Set<string>()
      return [...configPlugins, ...(this.plugins() ?? [])].filter((plugin) => {
        if (names.has(plugin.name)) return false
        names.add(plugin.name)
        return true
      })
    })

    /**
     * Merge config-level parse options under the instance `options` input so
     * instance values override config defaults, without writing back to the
     * input signal (the parser consumes the derived value instead).
     */
    protected override getParserOptions(): ParserOptions {
      return {
        ...parseOptions,
        ...this.options(),
        ...(this.unwrap() ? { unwrap: this.unwrap() } : {}),
        plugins: this.effectivePlugins(),
      }
    }
  }

  return DefinedMarkdownComponent as any
}

/**
 * Create a pre-configured MarkdownDocument component with default component mappings.
 *
 * @example
 * ```typescript
 * import { defineMarkdownDocumentComponent } from '@comark/angular'
 * import { Math } from '@comark/angular/plugins/math'
 *
 * export const DocsRenderer = defineMarkdownDocumentComponent({
 *   components: { Math },
 * })
 * ```
 */
export function defineMarkdownDocumentComponent(config: DefineMarkdownDocumentOptions = {}): Type<MarkdownDocument> {
  const { components: configComponents = {}, class: configClass } = config

  @Component({
    selector: 'comark-markdown-document-defined',
    standalone: true,
    imports: [MarkdownDocument],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <comark-markdown-document
        [value]="value()"
        [components]="mergedComponents()"
        [streaming]="streaming()"
        [caret]="caret()"
        [data]="data()"
      />
    `,
    host: {
      '[class]': 'hostClass',
    },
  })
  class DefinedMarkdownDocumentComponent extends MarkdownDocument {
    /** Instance-level components that are merged with config-level components. */
    override readonly components = input<Record<string, Type<any>>>({})

    protected readonly mergedComponents = computed(() => ({ ...configComponents, ...this.components() }))

    get hostClass(): string {
      return configClass || ''
    }
  }

  return DefinedMarkdownDocumentComponent as any
}

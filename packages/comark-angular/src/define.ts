import { Component, ChangeDetectionStrategy, Type, input, computed } from '@angular/core'
import type { NodeTransform, ParserOptions } from 'comark'
import { mergeNodeTransforms } from 'comark/utils'
import { Markdown } from './components/markdown.component'
import { MarkdownDocument } from './components/markdown-document.component'
import { mergeConfigPlugins } from './config'

export interface DefineMarkdownComponentOptions extends ParserOptions {
  /** Pre-configured component mappings. */
  components?: Record<string, Type<any>>
  /** Node transforms that run before the instance's own `transformNode`. */
  transformNode?: NodeTransform | readonly NodeTransform[]
  /** Additional CSS class for the wrapper. */
  class?: string
}

export interface DefineMarkdownDocumentOptions {
  /** Pre-configured component mappings. */
  components?: Record<string, Type<any>>
  /** Node transforms that run before the instance's own `transformNode`. */
  transformNode?: NodeTransform | readonly NodeTransform[]
  /** Additional CSS class for the wrapper. */
  class?: string
}

/**
 * Create a pre-configured Markdown component with default options, plugins, and components.
 *
 * The returned class extends `Markdown` and merges the config-level
 * defaults with any per-instance `@Input()` values at runtime.
 *
 * Angular AOT cannot statically resolve a component class produced by a factory
 * in `imports` (ngtsc error -991010 / NG1010). Prefer `provideMarkdown`
 * in AOT builds; this factory remains for JIT applications.
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
  const {
    components: configComponents = {},
    class: configClass,
    plugins: configPlugins = [],
    transformNode: configTransforms,
    ...parseOptions
  } = config

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
          [effects]="effects()"
          [data]="data()"
          [transformNode]="mergedTransforms()"
        />
      }
    `,
    host: {
      '[class]': 'hostClass',
    },
  })
  class DefinedMarkdownComponent extends Markdown {
    /** Instance-level components that are merged with config-level components. */
    override readonly components = input<Record<string, Type<any>>>({})

    protected override readonly mergedComponents = computed(() => ({ ...configComponents, ...this.components() }))

    protected override readonly mergedTransforms = computed(() =>
      mergeNodeTransforms(configTransforms, this.transformNode())
    )

    get hostClass(): string {
      return configClass || ''
    }

    /**
     * Merge config-level parse options under the instance `options` input so
     * instance values override config defaults, without writing back to the
     * input signal (the parser consumes the derived value instead).
     */
    protected override getParserOptions(): ParserOptions {
      const unwrap = this.unwrap()
      return {
        ...parseOptions,
        ...this.options(),
        ...(unwrap === undefined ? {} : { unwrap }),
        plugins: mergeConfigPlugins(configPlugins, this.plugins()),
      }
    }
  }

  return DefinedMarkdownComponent as any
}

/**
 * Create a pre-configured MarkdownDocument component with default component mappings.
 *
 * Angular AOT cannot statically resolve a component class produced by a factory
 * in `imports` (ngtsc error -991010 / NG1010). Prefer `provideMarkdownDocument`
 * in AOT builds; this factory remains for JIT applications.
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
        [effects]="effects()"
        [data]="data()"
        [transformNode]="mergedTransforms()"
      />
    `,
    host: {
      '[class]': 'hostClass',
    },
  })
  class DefinedMarkdownDocumentComponent extends MarkdownDocument {
    /** Instance-level components that are merged with config-level components. */
    override readonly components = input<Record<string, Type<any>>>({})

    protected override readonly mergedComponents = computed(() => ({ ...configComponents, ...this.components() }))

    protected override readonly mergedTransforms = computed(() =>
      mergeNodeTransforms(config.transformNode, this.transformNode())
    )

    get hostClass(): string {
      return configClass || ''
    }
  }

  return DefinedMarkdownDocumentComponent as any
}

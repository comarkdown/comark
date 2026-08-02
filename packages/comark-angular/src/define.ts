import { Component, Input, ChangeDetectionStrategy, Type } from '@angular/core'
import type { ParserOptions } from 'comark'
import { Markdown } from './components/markdown.component.ts'
import { MarkdownDocument } from './components/markdown-document.component.ts'
import { warnDeprecated } from './internal/deprecation.ts'

export interface DefineMarkdownComponentOptions extends ParserOptions {
  /** Display name for debugging (used as Angular selector). */
  name?: string
  /** Pre-configured component mappings. */
  components?: Record<string, Type<any>>
  /** Additional CSS class for the wrapper. */
  class?: string
}

export interface DefineMarkdownDocumentOptions {
  /** Display name for debugging (used as Angular selector). */
  name?: string
  /** Pre-configured component mappings. */
  components?: Record<string, Type<any>>
  /** Additional CSS class for the wrapper. */
  class?: string
}

/** @deprecated Use `DefineMarkdownComponentOptions` instead */
export type DefineComarkComponentOptions = DefineMarkdownComponentOptions

/** @deprecated Use `DefineMarkdownDocumentOptions` instead */
export type DefineMarkdownParsedOptions = DefineMarkdownDocumentOptions

/** @deprecated Use `DefineMarkdownDocumentOptions` instead */
export type DefineComarkRendererOptions = DefineMarkdownDocumentOptions

/**
 * Create a pre-configured Markdown component with default options, plugins, and components.
 *
 * The returned class extends `Markdown` and merges the config-level
 * defaults with any per-instance `@Input()` values at runtime.
 *
 * @example
 * ```typescript
 * import { defineMarkdownComponent } from '@comark/angular'
 * import math, { Math } from '@comark/angular/plugins/math'
 *
 * export const DocsMarkdown = defineMarkdownComponent({
 *   name: 'DocsMarkdown',
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
          [components]="mergedComponents"
          [streaming]="streaming"
          [caret]="caret"
          [data]="data"
        />
      }
    `,
    host: {
      '[class]': 'hostClass',
    },
  })
  class DefinedMarkdownComponent extends Markdown {
    /** Instance-level components that are merged with config-level components. */
    @Input() override components: Record<string, Type<any>> = {}

    get mergedComponents(): Record<string, Type<any>> {
      return { ...configComponents, ...this.components }
    }

    get hostClass(): string {
      return configClass || ''
    }

    override ngOnChanges(changes: any): void {
      // Merge config-level options and plugins with instance-level ones
      if (!this.options || Object.keys(this.options).length === 0) {
        this.options = { ...parseOptions }
      } else {
        this.options = { ...parseOptions, ...this.options }
      }

      if (!this.plugins || this.plugins.length === 0) {
        this.plugins = [...configPlugins]
      } else {
        this.plugins = [...configPlugins, ...this.plugins]
      }

      super.ngOnChanges(changes)
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
 *   name: 'DocsRenderer',
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
        [value]="value ?? tree"
        [components]="mergedComponents"
        [streaming]="streaming"
        [caret]="caret"
        [data]="data"
      />
    `,
    host: {
      '[class]': 'hostClass',
    },
  })
  class DefinedMarkdownDocumentComponent extends MarkdownDocument {
    /** Instance-level components that are merged with config-level components. */
    @Input() override components: Record<string, Type<any>> = {}

    get mergedComponents(): Record<string, Type<any>> {
      return { ...configComponents, ...this.components }
    }

    get hostClass(): string {
      return configClass || ''
    }
  }

  return DefinedMarkdownDocumentComponent as any
}

/**
 * @deprecated Use `defineMarkdownComponent` instead.
 */
export function defineComarkComponent(config: DefineMarkdownComponentOptions = {}): Type<Markdown> {
  warnDeprecated('defineComarkComponent', 'defineMarkdownComponent')
  return defineMarkdownComponent(config)
}

/**
 * @deprecated Use `defineMarkdownDocumentComponent` instead.
 */
export function defineMarkdownParsedComponent(config: DefineMarkdownDocumentOptions = {}): Type<MarkdownDocument> {
  warnDeprecated('defineMarkdownParsedComponent', 'defineMarkdownDocumentComponent')
  return defineMarkdownDocumentComponent(config)
}

/**
 * @deprecated Use `defineMarkdownDocumentComponent` instead.
 */
export function defineComarkRendererComponent(config: DefineMarkdownDocumentOptions = {}): Type<MarkdownDocument> {
  warnDeprecated('defineComarkRendererComponent', 'defineMarkdownDocumentComponent')
  return defineMarkdownDocumentComponent(config)
}

import type { Provider, Type } from '@angular/core'
import type { NodeTransform, ParserOptions } from 'comark'
import { MARKDOWN_CONFIG, MARKDOWN_DOCUMENT_CONFIG } from './config'
import type { MarkdownConfig, MarkdownDocumentConfig } from './config'

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
 * Configure the static `Markdown` component through Angular DI.
 *
 * Returns a config Provider for `MARKDOWN_CONFIG`. The `Markdown` component is
 * declared statically, so it stays analyzable by the Angular AOT compiler and
 * can be used in `imports`. AOT cannot statically resolve a component class
 * created by a factory function (ngtsc error -991010 / NG1010).
 *
 * @example
 * ```typescript
 * import { Component } from '@angular/core'
 * import { Markdown, defineMarkdownComponent } from '@comark/angular'
 * import { math, Math } from '@comark/angular/plugins/math'
 *
 * @Component({
 *   selector: 'app-docs',
 *   standalone: true,
 *   imports: [Markdown],
 *   providers: [
 *     defineMarkdownComponent({
 *       plugins: [math()],
 *       components: { Math },
 *       class: 'prose dark:prose-invert',
 *     }),
 *   ],
 *   template: `<comark-markdown [value]="content" />`,
 * })
 * export class DocsComponent {
 *   content = '# Hello'
 * }
 * ```
 */
export function defineMarkdownComponent(config: DefineMarkdownComponentOptions = {}): Provider {
  const {
    components: configComponents = {},
    class: configClass,
    plugins: configPlugins = [],
    transformNode: configTransforms,
    ...parseOptions
  } = config

  return {
    provide: MARKDOWN_CONFIG,
    useValue: {
      options: parseOptions,
      plugins: configPlugins,
      components: configComponents,
      transformNode: configTransforms,
      class: configClass,
    } satisfies MarkdownConfig,
  }
}

/**
 * Configure the static `MarkdownDocument` component through Angular DI.
 *
 * Returns a config Provider for `MARKDOWN_DOCUMENT_CONFIG`, which the static
 * `MarkdownDocument` component reads to pre-configure components and styling.
 *
 * @example
 * ```typescript
 * import { Component } from '@angular/core'
 * import { parseMarkdown } from 'comark'
 * import { MarkdownDocument, defineMarkdownDocumentComponent } from '@comark/angular'
 * import { Math } from '@comark/angular/plugins/math'
 *
 * @Component({
 *   selector: 'app-docs',
 *   standalone: true,
 *   imports: [MarkdownDocument],
 *   providers: [
 *     defineMarkdownDocumentComponent({
 *       components: { Math },
 *     }),
 *   ],
 *   template: `<comark-markdown-document [value]="document" />`,
 * })
 * export class DocsComponent {
 *   document = await parseMarkdown('# Hello')
 * }
 * ```
 */
export function defineMarkdownDocumentComponent(config: DefineMarkdownDocumentOptions = {}): Provider {
  const { components: configComponents = {}, class: configClass, transformNode: configTransforms } = config

  return {
    provide: MARKDOWN_DOCUMENT_CONFIG,
    useValue: {
      components: configComponents,
      transformNode: configTransforms,
      class: configClass,
    } satisfies MarkdownDocumentConfig,
  }
}

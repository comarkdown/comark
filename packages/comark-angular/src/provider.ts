import type { Provider } from '@angular/core'
import { MARKDOWN_CONFIG, MARKDOWN_DOCUMENT_CONFIG } from './config'
import type { MarkdownConfig, MarkdownDocumentConfig } from './config'
import type { DefineMarkdownComponentOptions, DefineMarkdownDocumentOptions } from './define'

/** Options for {@link provideMarkdown}. */
export type MarkdownProviderOptions = DefineMarkdownComponentOptions

/** Options for {@link provideMarkdownDocument}. */
export type MarkdownDocumentProviderOptions = DefineMarkdownDocumentOptions

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
 * import { Markdown, provideMarkdown } from '@comark/angular'
 * import { math, Math } from '@comark/angular/plugins/math'
 *
 * @Component({
 *   selector: 'app-docs',
 *   standalone: true,
 *   imports: [Markdown],
 *   providers: [
 *     provideMarkdown({
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
export function provideMarkdown(config: MarkdownProviderOptions = {}): Provider {
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
 * import { Component, OnInit } from '@angular/core'
 * import { parseMarkdown, type MarkdownDocument as MarkdownDocumentType } from 'comark'
 * import { MarkdownDocument, provideMarkdownDocument } from '@comark/angular'
 * import { Math } from '@comark/angular/plugins/math'
 *
 * @Component({
 *   selector: 'app-docs',
 *   standalone: true,
 *   imports: [MarkdownDocument],
 *   providers: [
 *     provideMarkdownDocument({
 *       components: { Math },
 *     }),
 *   ],
 *   template: `@if (document) { <comark-markdown-document [value]="document" /> }`,
 * })
 * export class DocsComponent implements OnInit {
 *   document?: MarkdownDocumentType
 *
 *   async ngOnInit(): Promise<void> {
 *     this.document = await parseMarkdown('# Hello')
 *   }
 * }
 * ```
 */
export function provideMarkdownDocument(config: MarkdownDocumentProviderOptions = {}): Provider {
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

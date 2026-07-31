export { Markdown } from './components/markdown.component.ts'
export { MarkdownDocument, MarkdownParsed } from './components/markdown-document.component.ts'
export { MarkdownNode } from './components/markdown-node.component.ts'
export {
  defineMarkdownComponent,
  defineMarkdownDocumentComponent,
  defineMarkdownParsedComponent,
  defineComarkComponent,
  defineComarkRendererComponent,
} from './define.ts'
export type {
  DefineMarkdownComponentOptions,
  DefineMarkdownDocumentOptions,
  DefineMarkdownParsedOptions,
} from './define.ts'

// Deprecated aliases — will be removed in a future major version
/** @deprecated Use `Markdown` instead */
export { ComarkComponent } from './components/markdown.component.ts'
/** @deprecated Use `MarkdownDocument` instead */
export { ComarkRendererComponent } from './components/markdown-document.component.ts'
/** @deprecated Use `MarkdownNode` instead */
export { NodeComponent as ComarkNodeComponent, NodeComponent } from './components/markdown-node.component.ts'
export type { DefineComarkComponentOptions, DefineComarkRendererOptions } from './define.ts'

export type * from 'comark'

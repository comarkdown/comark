export { Markdown } from './components/markdown.component.ts'
export { MarkdownParsed } from './components/markdown-parsed.component.ts'
export { MarkdownNode } from './components/markdown-node.component.ts'
export {
  defineMarkdownComponent,
  defineMarkdownParsedComponent,
  defineComarkComponent,
  defineComarkRendererComponent,
} from './define.ts'
export type { DefineMarkdownComponentOptions, DefineMarkdownParsedOptions } from './define.ts'

// Deprecated aliases — will be removed in a future major version
/** @deprecated Use `Markdown` instead */
export { ComarkComponent } from './components/markdown.component.ts'
/** @deprecated Use `MarkdownParsed` instead */
export { ComarkRendererComponent } from './components/markdown-parsed.component.ts'
/** @deprecated Use `MarkdownNode` instead */
export { ComarkNodeComponent } from './components/markdown-node.component.ts'
export type { DefineComarkComponentOptions, DefineComarkRendererOptions } from './define.ts'

export type * from 'comark'

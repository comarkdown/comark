import type { DumpOptions } from 'js-yaml'
import type MarkdownExit from 'markdown-exit'
import type MarkdownIt from 'markdown-it'

// #region Utility Types
/**
 * The `[keyof T] extends [never]` form (rather than `keyof T extends never`)
 * is the standard trick to prevent TS from distributing the check over a
 * union — we want to test "is T's keyset empty?" as one yes/no question.
 */
type Writable<T> = [keyof T] extends [never] ? Record<string, any> : T
// #endregion Utility Types

// #region MarkdownDocument

/**
 * A text node in the Markdown AST.
 */
export type TextNode = string

/**
 * Attributes bag on an element node (props + internal `$` meta).
 */
export type ElementNodeAttributes = {
  [key: string]: unknown

  $?: {
    line?: number
    html?: 0 | 1
    block?: 0 | 1
  }
}

/**
 * A comment node in the Markdown AST (`<!-- … -->`).
 * @param null - Null tag marks a comment
 * @param ElementNodeAttributes - Comment attributes
 * @param string - Comment content
 */
export type CommentNode = [null, ElementNodeAttributes, string]

/**
 * An element node in the Markdown AST: `[tag, attrs, ...children]`.
 */
export type ElementNode = [string, ElementNodeAttributes, ...Node[]]

/**
 * A node in the Markdown AST — element, text, or comment.
 *
 * `ElementNode` | `TextNode` | `CommentNode`
 */
export type Node = ElementNode | TextNode | CommentNode

/**
 * The Markdown document (parse output / AST root).
 * @param nodes - The nodes of the document
 * @param frontmatter - The frontmatter data which is the data at the top of the file
 * @param meta - The meta data of the document, it can be used to store additional data
 *
 * The `TMeta` and `TFrontmatter` type parameters allow `parse` / `createMarkdownParser`
 * to surface plugin-contributed keys with narrow types (see `MergePluginMeta`).
 */
export interface MarkdownDocument<TMeta = Record<string, any>, TFrontmatter = Record<string, any>> {
  nodes: Node[]
  frontmatter: TFrontmatter
  meta: TMeta
}

// Deprecated aliases from main — keep only original public names.

/**
 * @deprecated Use `TextNode` instead.
 * `ComarkText` will be removed in a future major version.
 */
export type ComarkText = TextNode

/**
 * @deprecated Use `ElementNodeAttributes` instead.
 * `ComarkElementAttributes` will be removed in a future major version.
 */
export type ComarkElementAttributes = ElementNodeAttributes

/**
 * @deprecated Use `CommentNode` instead.
 * `ComarkComment` will be removed in a future major version.
 */
export type ComarkComment = CommentNode

/**
 * @deprecated Use `ElementNode` instead.
 * `ComarkElement` will be removed in a future major version.
 */
export type ComarkElement = ElementNode

/**
 * @deprecated Use `Node` instead.
 * `ComarkNode` will be removed in a future major version.
 */
export type ComarkNode = Node

/**
 * @deprecated Use `MarkdownDocument` instead.
 * `ComarkTree` will be removed in a future major version.
 */
export type ComarkTree<TMeta = Record<string, any>, TFrontmatter = Record<string, any>> = MarkdownDocument<
  TMeta,
  TFrontmatter
>

// #endregion

// #region Renderer types and interfaces
export interface ContextBase {
  /**
   * true if node is inside html scope
   */
  html?: boolean

  /**
   * true if node is inside a list
   */
  list?: boolean

  /**
   * number if node is inside an ordered list
   */
  order?: number

  /**
   * @default '\n\n'
   */
  blockSeparator: string

  /**
   * @default 'markdown/comark'
   */
  format: 'markdown/comark' | 'markdown/html' | 'text/html' | 'text'

  /**
   * @default true
   */
  removeLastStyle?: boolean

  /**
   * Maximum number of inline attributes before switching to YAML block syntax.
   * Set to 0 to always use YAML block syntax.
   * @default 3
   */
  maxInlineAttributes?: number

  /**
   * Default syntax for block attributes when attributes exceed `maxInlineAttributes`.
   * - `'codeblock'` — wraps attributes in a fenced YAML code block with `[props]` label
   * - `'frontmatter'` — wraps attributes in `---` delimiters (frontmatter style)
   * @default 'codeblock'
   */
  blockAttributesStyle?: 'frontmatter' | 'codeblock'

  [key: string]: unknown
}

export interface CreateContext extends ContextBase {
  /**
   * user defined node handlers
   */
  handlers: Record<string, NodeHandler | ConditionalNodeHandler>
}

export interface Context extends ContextBase {
  /**
   * user defined node handlers
   */
  handlers: Record<string, NodeHandler>

  /**
   * The conditional handlers of the renderer
   */
  conditionalHandlers: ConditionalNodeHandler[]
}

/**
 * The NodeHandler function
 * @param node - The node to render
 * @param state - The state of the renderer
 * @param parent - The parent node
 * @returns The rendered node
 */
export type NodeHandler = (node: ElementNode, state: State, parent?: ElementNode) => string | Promise<string>

/**
 * A node handler rule that pairs a match predicate with a handler function.
 * When `match` returns true for a node, the associated `handler` is used to render it.
 */
export type ConditionalNodeHandler = {
  match: (node: ElementNode) => boolean
  handler: NodeHandler
}

/**
 * The State of the renderer
 * @param handlers - The handlers of the renderer
 * @param context - The context of the renderer
 * @param flow - Render children of the node
 * @param one - Render a single node
 * @param applyContext - The applyContext of the renderer
 * @returns The state of the renderer
 */
export type State = {
  /**
   * Additional data to pass to the renderer nodes, can be used to pass pre-fetched data to the renderer nodes
   */
  data: Record<string, any>

  /**
   * Render context — `{ frontmatter, meta, data, props }` — used to
   * resolve `:prefixed` attributes that reference dot-paths in markdown.
   * `props` is scoped to the nearest enclosing element as it's mutated during
   * recursion.
   */
  renderData: NodeRenderData

  /**
   * The context of the renderer
   */
  context: Context

  /**
   * The handlers of the renderer
   */
  handlers: Record<string, NodeHandler>

  /**
   * Render children of the node
   */
  flow: (node: ElementNode, state: State, parent?: ElementNode) => Promise<string>

  /**
   * Render a single node
   */
  one: (node: Node, state: State, parent?: ElementNode, atLineStart?: boolean) => Promise<string>

  /**
   * Render the input
   */
  render: (input: Node[] | ElementNode) => Promise<string>

  /**
   * Apply the context
   * @param edit - The edit to apply to the context
   * @returns The revert of the edit
   */
  applyContext: (edit: Record<string, unknown>) => Record<string, unknown>

  /**
   * The depth of the node in the tree
   */
  nodeDepthInTree?: number

  [key: string]: unknown
}

/**
 * The context of the renderer
 */
export interface RenderOptions {
  /**
   * Additional node handlers to pass to the renderer
   */
  components?: Record<string, NodeHandler | ConditionalNodeHandler>
  /**
   * Additional data to pass to the renderer nodes, can be used to pass pre-fetched data to the renderer nodes
   */
  data?: Record<string, any>

  [key: string]: unknown
}

/**
 * The options for rendering markdown
 */
export interface RenderMarkdownOptions extends RenderOptions {
  /**
   * Maximum number of inline attributes before switching to YAML block syntax.
   * Set to 0 to always use YAML block syntax.
   * @default 3
   */
  maxInlineAttributes?: number
  /**
   * Default syntax for block attributes when attributes exceed `maxInlineAttributes`.
   * - `'codeblock'` — wraps attributes in a fenced YAML code block with `[props]` label
   * - `'frontmatter'` — wraps attributes in `---` delimiters (frontmatter style)
   * @default 'codeblock'
   */
  blockAttributesStyle?: 'frontmatter' | 'codeblock'
  /**
   * Options for YAML serialization of frontmatter (js-yaml DumpOptions).
   * Defaults: indent=2, lineWidth=-1.
   */
  frontmatterOptions?: DumpOptions
}

export interface NodeRenderData {
  /*
   * Frontmatter data from the markdown file
   */
  frontmatter: Record<string, unknown>
  /**
   * Meta information from Comark Tree
   */
  meta: Record<string, unknown>
  /**
   * Additional data paased to rendere
   */
  data: Record<string, unknown>
  /**
   * Props from parent node
   */
  props: Record<string, unknown>
}
// #endregion

export type MarkdownExitPlugin = (md: MarkdownExit) => void
export type MarkdownItPlugin = (md: MarkdownIt) => void
export type MarkdownItPluginWithOptions<T> = (md: MarkdownIt, options: T) => void

export type ComarkParsePreState = {
  markdown: string
  options: ParseOptions

  [key: string]: any
}

export type ComarkParsePostState<TMeta = Record<string, any>, TFrontmatter = Record<string, any>> = {
  markdown: string
  tree: MarkdownDocument<TMeta, TFrontmatter>
  options: ParseOptions
  tokens: unknown[]

  [key: string]: any
}

/**
 * A Comark plugin.
 *
 * `TMeta` / `TFrontmatter` are phantom type parameters that record what this
 * plugin contributes to `tree.meta` / `tree.frontmatter`. They are surfaced
 * only via the optional `__meta` / `__frontmatter` markers — implementations
 * never set these at runtime; they exist purely so the contribution survives
 * `ReturnType<typeof factory>` inference and can be merged in `createMarkdownParser`.
 */
export type ComarkPlugin<TMeta = {}, TFrontmatter = {}> = {
  name: string
  markdownItPlugins?: MarkdownItPlugin[]
  pre?: (state: ComarkParsePreState) => Promise<void> | void
  post?: (state: ComarkParsePostState<Writable<TMeta>, Writable<TFrontmatter>>) => Promise<void> | void
  /** Phantom — used for type inference only. Never set at runtime. */
  __meta?: TMeta
  /** Phantom — used for type inference only. Never set at runtime. */
  __frontmatter?: TFrontmatter
}
export type ComarkPluginFactory<Options, TMeta = {}, TFrontmatter = {}> = (
  opts?: Options
) => ComarkPlugin<TMeta, TFrontmatter>

// #region Plugin type inference helpers

type PluginMetaOf<P> = P extends ComarkPlugin<infer M, any> ? M : {}
type PluginFrontmatterOf<P> = P extends ComarkPlugin<any, infer F> ? F : {}

/**
 * Walk a tuple of plugins and intersect their meta contributions.
 * Returns `{}` when the tuple is empty or when nothing was contributed.
 */
export type MergePluginMeta<TPlugins extends readonly unknown[]> = TPlugins extends readonly [infer Head, ...infer Rest]
  ? PluginMetaOf<Head> & MergePluginMeta<Rest extends readonly unknown[] ? Rest : []>
  : {}

/**
 * Walk a tuple of plugins and intersect their frontmatter contributions.
 */
export type MergePluginFrontmatter<TPlugins extends readonly unknown[]> = TPlugins extends readonly [
  infer Head,
  ...infer Rest,
]
  ? PluginFrontmatterOf<Head> & MergePluginFrontmatter<Rest extends readonly unknown[] ? Rest : []>
  : {}

/**
 * When no plugin contributed meta keys, fall back to the permissive
 * `Record<string, any>` (backwards-compatible). Otherwise, preserve narrow
 * keys and type unknown accesses as `unknown` (safer than `any`).
 */
export type ResolvedMeta<T> = [keyof T] extends [never] ? Record<string, any> : T & Record<string, unknown>
export type ResolvedFrontmatter<T> = [keyof T] extends [never] ? Record<string, any> : T & Record<string, unknown>

// #endregion

export type ComponentManifest = (name: string) => unknown | Promise<unknown> | undefined | null
export interface ComarkContextProvider {
  components: Record<string, any>
  componentManifest: ComponentManifest
}

export interface ParseOptions<TPlugins extends readonly ComarkPlugin<any, any>[] = readonly ComarkPlugin<any, any>[]> {
  /**
   * Whether to automatically unwrap single paragraphs in container components.
   * When enabled, if a container component (alert, card, callout, note, warning, tip, info)
   * has only a single paragraph child, the paragraph wrapper is removed and its children
   * become direct children of the container. This creates cleaner HTML output.
   *
   * @default true
   * @example
   * // With autoUnwrap: true (default)
   * // <alert><strong>Text</strong></alert>
   *
   * // With autoUnwrap: false
   * // <alert><p><strong>Text</strong></p></alert>
   */
  autoUnwrap?: boolean

  /**
   * Remove wrapper tags from the parsed tree, hoisting their children up in
   * place. Mirrors the MDC `unwrap` behaviour and is primarily used to strip
   * the `<p>` wrapper for single-line / inline rendering, e.g.
   * `<Button><Markdown :value="text" :options="{ unwrap: 'p' }" /></Button>`.
   *
   * - `true` — unwrap paragraphs (`p`)
   * - `string` — comma- or whitespace-separated tag names, e.g. `'p, h1'` or `'div p'`
   * - `string[]` — explicit list of tag names
   * - `'*'` — matches any tag
   *
   * Tags are applied sequentially: each tag descends one level into the result
   * of the previous one, so `'div p'` unwraps a `<div>` then the `<p>` inside
   * it. After unwrapping, adjacent text nodes are merged into a single string
   * (like MDC): `a\n\nb` becomes `ab`.
   *
   * @default false
   * @example
   * // With unwrap: 'p'
   * // Input:  `Hello **world**`
   * // Nodes:  ['Hello ', ['strong', {}, 'world']]   (no <p> wrapper)
   */
  unwrap?: boolean | string | string[]

  /**
   * Whether to automatically close unclosed markdown and Comark components.
   * @default true
   */
  autoClose?: boolean

  /**
   * Whether to parse HTML tags embedded in Comark/markdown content.
   * When enabled, HTML block and inline elements are parsed into AST nodes and can be
   * mixed freely with Comark components and markdown syntax.
   *
   * @default true
   * @example
   * // With html: true (default) — HTML is parsed into AST nodes
   * // Input: `<strong class="bold">text</strong>`
   * // AST:   ['strong', { class: 'bold' }, 'text']
   *
   * // HTML can be mixed with Comark components:
   * // Input:
   * // <div>
   * //   ::alert
   * //   Hello <em>world</em>
   * //   ::
   * // </div>
   *
   * // With html: false — HTML tags are left as raw text / ignored
   */
  html?: boolean

  /**
   * Set `false` to disable autoconvert URL-like text to links.
   * @default true
   */
  linkify?: boolean

  /**
   * Whether to auto-generate `id` attributes for `h1`–`h6` headings from their text content.
   * Set `false` to skip auto-generated ids; user-supplied `id` attributes are still preserved.
   *
   * @default true
   * @example
   * // With headingIds: true (default)
   * // # Hello World → ['h1', { id: 'hello-world' }, 'Hello World']
   *
   * // With headingIds: false
   * // # Hello World → ['h1', {}, 'Hello World']
   * // # Hello {id="custom"} → ['h1', { id: 'custom' }, 'Hello']
   */
  headingIds?: boolean

  /**
   * Additional plugins to use
   * @default []
   */
  plugins?: TPlugins
}

/**
 * Type signature for the options object passed to the Comark parser function returned by createMarkdownParser().
 */
export type ComarkParseFnOptions = { streaming?: boolean }

/**
 * Type signature for the async Comark parser function returned by createMarkdownParser().
 * Accepts a markdown string and optional parsing options, and returns a Promise of MarkdownDocument.
 */
export type ComarkParseFn<TMeta = Record<string, any>, TFrontmatter = Record<string, any>> = (
  markdown: string,
  opts?: ComarkParseFnOptions
) => Promise<MarkdownDocument<TMeta, TFrontmatter>>

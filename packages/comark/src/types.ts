import type { DumpOptions } from 'js-yaml'
import type MarkdownExit from 'markdown-exit'
import type MarkdownIt from 'markdown-it'

// #region ComarkTree

/**
 * The Comark text
 * @param string - The text content
 */
export type ComarkText = string

/**
 * The Comark comment
 * @param null - The null node
 * @param {} - The attributes of the comment
 * @param string - The content of the comment
 */
export type ComarkComment = [null, ComarkElementAttributes, string]

/**
 * The Comark element attributes
 * @param [key: string]: unknown - The attributes of the element
 */
export type ComarkElementAttributes = {
  [key: string]: unknown

  $?: {
    line?: number
    html?: 0 | 1
    block?: 0 | 1
  }
}

/**
 * The Comark element
 * @param string - The tag of the element
 * @param ComarkElementAttributes - The attributes of the element
 * @param ...ComarkNode[] - The children of the element
 */
export type ComarkElement = [string, ComarkElementAttributes, ...ComarkNode[]]

/**
 * The Comark node
 *
 * `ComarkElement` | `ComarkText` | `ComarkComment` - The node can be an element, text or comment
 */
export type ComarkNode = ComarkElement | ComarkText | ComarkComment

/**
 * The Comark tree
 * @param nodes - The nodes of the tree
 * @param frontmatter - The frontmatter data which is the data at the top of the file
 * @param meta - The meta data of tree, it can be used to store additional data for the tree
 */
export interface ComarkTree {
  nodes: ComarkNode[]
  frontmatter: Record<string, any>
  meta: Record<string, any>
}

// #endregion

// #region Renderer types and interfaces
interface StringifyOptions {
  /**
   * @default '\n\n'
   */
  blockSeparator: string

  /**
   * @default 'markdown/comark'
   */
  format: 'markdown/comark' | 'markdown/html' | 'text/html' | 'text'
  /**
   * user defined node handlers
   */
  handlers: Record<string, NodeHandler>

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
   * Additional options
   */
  [key: string]: unknown
}

export interface Context extends StringifyOptions {
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

  [key: string]: unknown
}

/**
 * The NodeHandler function
 * @param node - The node to render
 * @param state - The state of the renderer
 * @param parent - The parent node
 * @returns The rendered node
 */
export type NodeHandler = (node: ComarkElement, state: State, parent?: ComarkElement) => string | Promise<string>

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
  flow: (node: ComarkElement, state: State, parent?: ComarkElement) => Promise<string>

  /**
   * Render a single node
   */
  one: (node: ComarkNode, state: State, parent?: ComarkElement) => Promise<string>

  /**
   * Render the input
   */
  render: (input: ComarkNode[] | ComarkElement) => Promise<string>

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
  components?: Record<string, NodeHandler>
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
   * Options for YAML serialization of frontmatter (js-yaml DumpOptions).
   * Defaults: indent=2, lineWidth=-1.
   */
  frontmatterOptions?: DumpOptions
}
// #endregion

export type MarkdownExitPlugin = (md: MarkdownExit) => void
export type MarkdownItPlugin = (md: MarkdownIt) => void

export type ComarkParsePreState = {
  markdown: string
  options: ParseOptions

  [key: string]: any
}

export type ComarkParsePostState = {
  markdown: string
  tree: ComarkTree
  options: ParseOptions
  tokens: unknown[]

  [key: string]: any
}

export type ComarkPlugin = {
  name: string
  markdownItPlugins?: MarkdownItPlugin[]
  pre?: (state: ComarkParsePreState) => Promise<void> | void
  post?: (state: ComarkParsePostState) => Promise<void> | void
}
export type ComarkPluginFactory<Options> = (opts?: Options) => ComarkPlugin

export type ComponentManifest = (name: string) => Promise<unknown> | undefined | null
export interface ComarkContextProvider {
  components: Record<string, any>
  componentManifest: ComponentManifest
}
export interface ParseOptions {
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
   * Additional plugins to use
   * @default []
   */
  plugins?: ComarkPlugin[]
}

/**
 * Type signature for the options object passed to the Comark parser function returned by createParse().
 */
export type ComarkParseFnOptions = { streaming?: boolean }

/**
 * Type signature for the async Comark parser function returned by createParse().
 * Accepts a markdown string and optional parsing options, and returns a Promise of ComarkTree.
 */
export type ComarkParseFn = (markdown: string, opts?: ComarkParseFnOptions) => Promise<ComarkTree>

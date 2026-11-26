import type { DumpOptions } from 'js-yaml'
import type { MarkdownDocument, RendererOptions, RenderMarkdownOptions } from 'comark'
import { stringifyYaml } from '../utils/yaml.ts'

import { createState, one } from '../internal/stringify/state.ts'
import { handlers } from '../internal/stringify/handlers/index.ts'

export type {
  NodeHandler,
  State,
  FlowOptions,
  Context,
  RendererOptions,
  RenderMarkdownOptions,
  NodeRenderData,
  NodeTransform,
  NodeTransformContext,
  NodeTransformResult,
} from '../types.ts'

// Re-export attribute resolvers for custom handlers that want to honor `:prefix` bindings
export { resolveAttributes, resolveAttribute } from '../internal/stringify/attributes.ts'

/** Prepend serialized YAML frontmatter (`---`) to markdown content when `data` is non-empty. */
export function renderFrontmatter(
  data: Record<string, any> | undefined | null,
  content?: string,
  yamlOptions?: DumpOptions
): string {
  if (!data || Object.keys(data).length === 0) {
    return content?.trim() || ''
  }

  const fm = stringifyYaml(data, yamlOptions).trim()
  if (content) {
    return '---\n' + fm + '\n---\n\n' + content.trim()
  }

  return fm
}

/** Render a Markdown document to a string in the configured format. */
export async function render(
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  context: RendererOptions = {}
): Promise<string> {
  const state = createState(handlers, { ...context, tree: document as MarkdownDocument, handlers: context.components })

  let result = ''
  for (const child of document.nodes) {
    result += await one(child, state)
  }
  return result.trim() + '\n'
}

/** Render a Markdown document to Comark markdown, including frontmatter when present. */
export async function renderMarkdown(
  document: MarkdownDocument | { nodes: MarkdownDocument['nodes'] },
  options?: RenderMarkdownOptions
): Promise<string> {
  const content = await render(document, { format: 'markdown/comark', ...options })
  return renderFrontmatter((document as MarkdownDocument).frontmatter || {}, content, options?.frontmatterOptions)
}

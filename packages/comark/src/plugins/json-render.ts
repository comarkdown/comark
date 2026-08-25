import type { Spec, UIElement } from '@json-render/core'
import type { ElementNodeAttributes, Node } from '../types'
import { defineComarkPlugin } from '../parse.ts'
import { textContent, visit } from '../utils/index.ts'
import { parseYaml } from '../internal/yaml.ts'

// Budgets for spec expansion. Specs are author-controlled and elements can
// reference the same key many times (a DAG), so recursive materialization
// must be bounded — otherwise a ~1KB fence inflates into billions of AST
// nodes and exhausts the heap before any renderer or sanitizer runs.
const MAX_EXPANDED_NODES = 10_000
const MAX_DEPTH = 100

function jsonRenderToAst(jrt: Spec | UIElement) {
  if (!(jrt as Spec).root) {
    jrt = {
      root: 'template',
      elements: { template: jrt as UIElement },
    }
  }

  const tree = jrt as Spec

  const root = tree.elements[tree.root]
  return jsonRenderElementToAst(root, tree.elements, 0, { nodes: 0 })
}

function jsonRenderElementToAst(
  element: UIElement,
  elements: Record<string, UIElement>,
  depth: number,
  budget: { nodes: number }
): Node {
  if (depth > MAX_DEPTH || ++budget.nodes > MAX_EXPANDED_NODES) {
    throw new Error('json-render spec exceeds the expansion budget')
  }
  if (element.type === 'Text') {
    return String(element.props.content)
  }

  const children = element.children?.map((childName) => elements[childName]).filter(Boolean) || []
  return [
    element.type,
    element.props,
    ...children.map((child) => jsonRenderElementToAst(child, elements, depth + 1, budget)),
  ]
}

interface JsonRenderConfig {}

/**
 * Plugin for rendering [JSON Render](https://json-render.dev/) specs as UI components.
 *
 * Transforms `json-render` fenced code blocks into Comark AST nodes at parse time.
 * Supports both full specs (with `root` and `elements`) and single-element shorthand.
 *
 * @param config - Plugin configuration options
 *
 * @example
 * ```ts
 * import { parseMarkdown } from 'comark'
 * import jsonRender from 'comark/plugins/json-render'
 *
 * const result = await parseMarkdown(`
 * \`\`\`json-render
 * {
 *   "root": "card",
 *   "elements": {
 *     "card": {
 *       "type": "Card",
 *       "props": { "title": "Hello" },
 *       "children": ["text"]
 *     },
 *     "text": {
 *       "type": "Text",
 *       "props": { "content": "World" }
 *     }
 *   }
 * }
 * \`\`\`
 * `, {
 *   plugins: [jsonRender()]
 * })
 * ```
 *
 * @example
 * ```vue
 * <script setup>
 * import { Markdown } from '@comark/vue'
 * import jsonRender from '@comark/vue/plugins/json-render'
 * </script>
 *
 * <template>
 *   <Suspense>
 *     <Markdown :plugins="[jsonRender()]">{{ content }}</Markdown>
 *   </Suspense>
 * </template>
 * ```
 */
export default defineComarkPlugin((_config: JsonRenderConfig = {}) => ({
  name: 'json-render',
  post: async (state) => {
    visit(
      state.tree,
      (node) =>
        node[0] === 'pre' &&
        ((node[1] as ElementNodeAttributes).language === 'json-render' ||
          (node[1] as ElementNodeAttributes).language === 'yaml-render'),
      (preNode) => {
        const language = (preNode[1] as ElementNodeAttributes).language
        try {
          let spec: Spec | UIElement | undefined = undefined
          if (language === 'json-render') {
            spec = JSON.parse(textContent(preNode)) as unknown as Spec | UIElement
          } else if (language === 'yaml-render') {
            spec = parseYaml(textContent(preNode)) as unknown as Spec | UIElement
          }

          if (spec) {
            return jsonRenderToAst(spec)
          }
        } catch {
          // nothing to do
        }
      }
    )
  },
}))

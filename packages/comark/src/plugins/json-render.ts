import type { Spec, UIElement } from '@json-render/core'
import type { ComarkElementAttributes, ComarkNode } from '../types'
import { defineComarkPlugin } from '../parse.ts'
import { textContent, visit } from '../utils/index.ts'
import { parseYaml } from '../internal/yaml.ts'

function jsonRenderToAst(jrt: Spec | UIElement) {
  if (!(jrt as Spec).root) {
    jrt = {
      root: 'template',
      elements: { template: jrt as UIElement },
    }
  }

  const tree = jrt as Spec

  const root = tree.elements[tree.root]
  return jsonRenderElementToAst(root, tree.elements)
}

function jsonRenderElementToAst(element: UIElement, elements: Record<string, UIElement>): ComarkNode {
  if (element.type === 'Text') {
    return String(element.props.content)
  }

  const children = element.children?.map(childName => elements[childName])
    .filter(Boolean) || []
  return [
    element.type,
    element.props,
    ...children.map(child => jsonRenderElementToAst(child, elements)),
  ]
}

interface JsonRenderConfig {

}

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
 * import { parse } from 'comark'
 * import jsonRender from 'comark/plugins/json-render'
 *
 * const result = await parse(`
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
 * import { Comark } from '@comark/vue'
 * import jsonRender from '@comark/vue/plugins/json-render'
 * </script>
 *
 * <template>
 *   <Suspense>
 *     <Comark :plugins="[jsonRender()]">{{ content }}</Comark>
 *   </Suspense>
 * </template>
 * ```
 */
export default defineComarkPlugin((_config: JsonRenderConfig = {}) => ({
  name: 'json-render',
  post: async (state) => {
    visit(
      state.tree,
      node => node[0] === 'pre' && (
        (node[1] as ComarkElementAttributes).language === 'json-render'
        || (node[1] as ComarkElementAttributes).language === 'yaml-render'
      ),
      (preNode) => {
        const language = (preNode[1] as ComarkElementAttributes).language
        try {
          let spec: Spec | UIElement | undefined = undefined
          if (language === 'json-render') {
            spec = JSON.parse(textContent(preNode)) as unknown as Spec | UIElement
          }
          else if (language === 'yaml-render') {
            spec = parseYaml(textContent(preNode)) as unknown as Spec | UIElement
          }

          if (spec) {
            return jsonRenderToAst(spec)
          }
        }
        catch {
          // nothing to do
        }
      },
    )
  },
}))

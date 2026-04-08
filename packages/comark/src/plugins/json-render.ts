import type { Spec, UIElement } from '@json-render/core'
import type { ComarkElementAttributes, ComarkNode } from '../types'
import { defineComarkPlugin } from '../parse'
import { textContent, visit } from '../utils'

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

export default defineComarkPlugin((_config: JsonRenderConfig = {}) => ({
  name: 'json-render',
  pre: async (_state) => {
    // register options to for highlight to ignore json-render blocks
  },
  post: async (state) => {
    visit(state.tree, (node) => {
      if (node[0] === 'pre' && (node[1] as ComarkElementAttributes).language === 'json-render') {
        return true
      }
      return false
    }, (preNode) => {
      const ast = JSON.parse(textContent(preNode))
      return jsonRenderToAst(ast)
    })
  },
}))

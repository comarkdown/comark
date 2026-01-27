import type { Root, RootContent, MDCNode, MDCRoot, NodePosition } from '@nuxtjs/mdc'
import Slugger from 'github-slugger'
import { toString } from 'hast-util-to-string'
import { validateProps } from '../../src/utils/props-validation'

export interface CompilerOptions {
  keepPosition?: boolean
  keepComments?: boolean
}

export function mdcCompiler(this: any, options: CompilerOptions = {}) {
  // Create new slugger for each Tree to generate
  const slugs = new Slugger()

  function compileToJSON(node: Root, parent?: Root | RootContent): MDCRoot
  function compileToJSON(node: RootContent, parent?: Root | RootContent): MDCNode
  function compileToJSON(node: Root | RootContent, parent?: Root | RootContent): MDCNode | MDCRoot | null {
    if (node.type === 'root') {
      return {
        type: 'root',
        children: node.children.map(child => compileToJSON(child, node)).filter(Boolean),
      }
    }

    const position: NodePosition | undefined = (node.position?.start?.offset && node.position?.end?.offset)
      ? {
          start: node.position.start.offset!,
          end: node.position.end.offset!,
        }
      : undefined

    if (node.type === 'element') {
      // Remove empty paragraphs
      if (node.tagName === 'p' && node.children.every(child => child.type === 'text' && /^\s*$/.test(child.value))) {
        return null
      }

      if (node.tagName === 'li') {
        // unwrap unwanted paragraphs around `<li>` children
        let hasPreviousParagraph = false
        node.children = (node.children)?.flatMap((child) => {
          if (child.type === 'element' && child.tagName === 'p') {
            if (hasPreviousParagraph) {
              // Insert line break before new paragraph
              child.children!.unshift({
                type: 'element',
                tagName: 'br',
                properties: {},
                children: [],
              })
            }

            hasPreviousParagraph = true
            return child.children
          }
          return child
        })
      }

      // Generate id for headings
      if (node.tagName?.match(/^h\d$/)) {
        node.properties = node.properties || {}
        node.properties.id = String(node.properties?.id || slugs.slug(toString(node as any)))
          .replace(/-+/g, '-')
          .replace(/^-|-$/g, '')
          .replace(/^(\d)/, '_$1')
      }

      // Convert component-slot tags to template
      if (node.tagName === 'component-slot') {
        node.tagName = 'template'
      }

      // Hast has a special handling for template tags to read from `content` property instead of `children`
      // https://github.com/syntax-tree/hast-util-to-html/blob/c8d5f675173bb75bde36dd7e01c77010f0c41901/lib/handle/element.js#L81-L83
      // https://github.com/syntax-tree/hast#element
      const children = (
        node.tagName === 'template' && node.content?.children.length
          ? node.content.children
          : node.children
      )
        .map(child => compileToJSON(child, node))
        .filter(Boolean)

      const props = validateProps(node.tagName, node.properties)

      // To match with markdown-it-mdc plugin
      if (node.tagName === 'pre') {
        if (children[0]?.type === 'element' && children[0]?.tag === 'code' && children[0]?.props?.class) {
          props.class = children[0].props.class
        }
      }

      const result = {
        type: 'element',
        tag: node.tagName,
        props,
        children,
      } as MDCNode

      if (options.keepPosition) {
        result.position = position
      }

      return result
    }

    // Keep non-newline text nodes
    if (node.type === 'text') {
      if (!/^\n+$/.test(node.value || '') || (parent as any)?.properties?.emptyLinePlaceholder) {
        return options.keepPosition ? { type: 'text', value: node.value, position } : { type: 'text', value: node.value }
      }
    }

    if (options.keepComments && node.type === 'comment') {
      return options.keepPosition ? { type: 'comment', value: node.value, position } : { type: 'comment', value: node.value }
    }

    // Remove other nodes from tree
    return null
  }

  this.Compiler = (tree: Root) => {
    const body = compileToJSON(tree)

    let excerpt: MDCRoot | undefined
    const excerptIndex = tree.children.findIndex(node => node.type === 'comment' && node.value?.trim() === 'more')
    if (excerptIndex !== -1) {
      excerpt = compileToJSON({
        type: 'root',
        children: tree.children.slice(0, excerptIndex),
      })

      // Include styles if excerpt contains code block
      if (excerpt.children.find(node => node.type === 'element' && node.tag === 'pre')) {
        const lastChild = body.children[body.children.length - 1]
        if (lastChild && lastChild.type === 'element' && lastChild.tag === 'style') {
          excerpt.children.push(lastChild)
        }
      }
    }

    // Top level text nodes are not allowed
    body.children = (body.children || []).filter(child => child.type !== 'text')

    return {
      body,
      excerpt,
    }
  }
}

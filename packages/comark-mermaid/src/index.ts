import type MarkdownIt from 'markdown-it'
import type { ComarkPlugin } from 'comark'

export interface MermaidConfig {
  /**
   * Theme for mermaid diagrams
   * @default 'default'
   */
  theme?: 'default' | 'dark' | 'forest' | 'neutral'
}

/**
 * markdown-it plugin for mermaid diagrams
 * This handles ```mermaid code blocks
 */
function markdownItMermaid(md: MarkdownIt, config?: MermaidConfig) {
  md.core.ruler.after('block', 'replace-pre', (state) => {
    for (const token of state.tokens) {
      if (token.type === 'fence' && token.info?.startsWith('mermaid')) {
        let info = token.info.substring(7).trim()
        let props: [string, string][] = []
        // extract props from info
        const curlyBraceIndex = info.indexOf('{')
        if (curlyBraceIndex !== -1) {
          const result = searchProps(info.substring(curlyBraceIndex))
          if (result) {
            console.log('result', result)
            props = result.props
            info = info.substring(result.index)
          }
        }
        // set type, tag, props and content
        token.type = 'mermaid'
        token.tag = 'mermaid'
        for (const prop of props) {
          token.attrJoin(prop[0], prop[1])
        }
        if (config?.theme) {
          token.attrSet('theme', config.theme)
        }
        token.info = info
        token.attrSet('content', token.content)
      }
    }
  })
}

export function searchProps(content: string, index = 0) {
  const bracketPairs = {
    '[': ']',
    '{': '}',
    '(': ')',
  }
  const quotePairs = {
    '\'': '\'',
    '"': '"',
    '`': '`',
  }
  if (content[index] !== '{')
    throw new Error(`Invalid props, expected \`{\` but got '${content[index]}'`)

  const props: [string, string][] = []

  // Vue's mustache {{ }} syntax
  if (content[index + 1] === '{')
    return undefined

  index += 1

  while (index < content.length) {
    if (content[index] === '\\') {
      index += 2
    }
    else if (content[index] === '}') {
      index += 1
      break
    }
    else if (content[index] === ' ') {
      index += 1
    }
    else if (content[index] === '.') {
      index += 1
      props.push([
        'class',
        searchUntil(' #.}'),
      ])
    }
    else if (content[index] === '#') {
      index += 1
      props.push([
        'id',
        searchUntil(' #.}'),
      ])
    }
    else {
      const start = index
      while (index < content.length) {
        index += 1
        if (' }='.includes(content[index]))
          break
      }
      const char = content[index]
      if (start !== index) {
        const key = content.slice(start, index).trim()
        if (char === '=') {
          index += 1
          props.push([
            key,
            searchValue(),
          ])
        }
        else {
          props.push([
            key,
            'true',
          ])
        }
      }
    }
  }

  function searchUntil(str: string) {
    const start = index
    while (index < content.length) {
      index += 1
      if (content[index] === '\\')
        index += 2
      if (str.includes(content[index]))
        break
    }
    return content.slice(start, index)
  }

  function searchValue() {
    const start = index
    if (content[index] in bracketPairs) {
      searchBracket(bracketPairs[content[index] as keyof typeof bracketPairs])
      index += 1
      return content.slice(start, index)
    }
    else if (content[index] in quotePairs) {
      searchString(quotePairs[content[index] as keyof typeof quotePairs])
      index += 1
      return content.slice(start, index)
    }
    else {
      // unquoted value
      return searchUntil(' }')
    }
  }

  function searchBracket(end: string) {
    while (index < content.length) {
      index++
      if (content[index] in quotePairs)
        searchString(quotePairs[content[index] as keyof typeof quotePairs])
      else if (content[index] in bracketPairs)
        searchBracket(bracketPairs[content[index] as keyof typeof bracketPairs])
      else if (content[index] === end)
        return
    }
  }

  function searchString(end: string) {
    return searchUntil(end)
  }

  // Escale quotes
  props.forEach((v) => {
    if (v[1].match(/^(['"`]).*\1$/))
      v[1] = v[1].slice(1, -1)
  })

  return {
    props,
    index,
  }
}

/**
 * Create mermaid plugin for comark
 *
 * This plugin processes markdown-it tokens and identifies mermaid code blocks
 * for rendering by Vue/React components.
 *
 * @param config Mermaid rendering configuration
 *
 * @example
 * ```ts
 * import { parse } from 'comark'
 * import { createMermaidPlugin } from '@comark/mermaid'
 *
 * const mermaidPlugin = createMermaidPlugin({ theme: 'dark' })
 * const result = await parse('```mermaid\ngraph TD; A-->B;\n```', {
 *   plugins: [mermaidPlugin()]
 * })
 * ```
 */
export default function comarkMermaid(config?: MermaidConfig): ComarkPlugin {
  return {
    markdownItPlugins: [
      (md: MarkdownIt) => markdownItMermaid(md, config),
    ],
  }
}

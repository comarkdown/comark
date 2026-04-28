import type { LanguageRegistration, ShikiTransformer, ShikiPrimitive, ThemeRegistration } from 'shiki'
import type { ComarkElement, ComarkNode, ComarkTree, ComarkElementAttributes } from 'comark'
import { defineComarkPlugin } from '../utils/helpers.ts'
import { createShikiPrimitive } from 'shiki'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import { codeToHast } from 'shiki/core'
import comakLanguage from '../utils/comark.tmLanguage.ts'

export interface HighlightOptions {
  /**
   * Whether to use the default language definitions
   * @default true
   */
  registerDefaultLanguages?: boolean

  /**
   * Whether to use the default theme definitions
   * @default true
   */
  registerDefaultThemes?: boolean

  /**
   * Languages to preload. If not specified, languages will be loaded on demand.
   * @default undefined (load on demand)
   */
  languages?: Array<LanguageRegistration | LanguageRegistration[]>

  /**
   * Additional themes to preload
   * @default { light: 'material-theme-lighter', dark: 'material-theme-palenight' }
   */
  themes?: {
    light?: ThemeRegistration
    dark?: ThemeRegistration
  }

  /**
   * Transformers to apply to the code blocks
   * @default undefined
   */
  transformers?: ShikiTransformer[]
  /**
   * Whether to add pre styles to the code blocks
   * @default false
   */
  preStyles?: boolean
}

export interface CodeBlockAttributes {
  language?: string
  class?: string
  highlights?: number[]
  meta?: string
}

let highlighter: ShikiPrimitive | null = null
let highlighterPromise: Promise<ShikiPrimitive> | null = null
const loadedThemes: Set<string> = new Set()
const loadedLanguages: Set<string> = new Set()

/**
 * Get or create the Shiki highlighter instance
 * Uses a singleton pattern to avoid creating multiple highlighters
 */
export async function getHighlighter(options: HighlightOptions = {}): Promise<ShikiPrimitive> {
  if (highlighter) {
    // Fast path: skip registerDefaults() when no custom themes/languages are requested
    if (!options.themes && !options.languages) {
      return highlighter
    }
    const { themes, languages } = await registerDefaults(options)
    await Promise.all(themes.map(theme => loadTheme(highlighter!, theme)))
    await Promise.all(languages.map(language => loadLanguage(highlighter!, language)))

    return highlighter
  }

  if (highlighterPromise) {
    return highlighterPromise
  }

  try {
    highlighterPromise = (async () => {
      const { themes, languages } = await registerDefaults(options)
      const hl = createShikiPrimitive({
        themes: themes,
        langs: languages,
        langAlias: {
          'md': 'mdc',
          'markdown': 'mdc',
          'comark': 'mdc',
          'json-render': 'json',
          'yaml-render': 'yaml',
        },
        engine: createJavaScriptRegexEngine({ forgiving: true }),
      })

      await Promise.all(themes.map(theme => loadTheme(hl, theme)))
      await Promise.all(languages.map(language => loadLanguage(hl, language)))

      return hl
    })() as Promise<ShikiPrimitive>

    highlighter = await highlighterPromise
    highlighterPromise = null

    return highlighter
  }
  catch (error) {
    console.error('Failed to create highlighter: make sure `shiki` is installed', error)
    throw error
  }
}

async function registerDefaults(options: HighlightOptions) {
  const themes = Object.values(options.themes || {}) as ThemeRegistration[]
  const languages = options.languages || [] as Array<LanguageRegistration | LanguageRegistration[]>
  const promises: Array<Promise<{ type: 'theme' | 'lang', value: any }>> = []

  if (options.registerDefaultThemes !== false) {
    promises.push(
      import('shiki/dist/themes/material-theme-lighter.mjs').then(m => ({ type: 'theme' as const, value: m.default })),
      import('shiki/dist/themes/material-theme-palenight.mjs').then(m => ({ type: 'theme' as const, value: m.default })),
    )
  }
  if (options.registerDefaultLanguages !== false) {
    promises.push(
      import('shiki/dist/langs/vue.mjs').then(m => ({ type: 'lang' as const, value: m.default })),
      import('shiki/dist/langs/tsx.mjs').then(m => ({ type: 'lang' as const, value: m.default })),
      import('shiki/dist/langs/svelte.mjs').then(m => ({ type: 'lang' as const, value: m.default })),
      import('shiki/dist/langs/typescript.mjs').then(m => ({ type: 'lang' as const, value: m.default })),
      import('shiki/dist/langs/javascript.mjs').then(m => ({ type: 'lang' as const, value: m.default })),
      // import('shiki/dist/langs/mdc.mjs').then(m => ({ type: 'lang' as const, value: m.default })),
      import('shiki/dist/langs/bash.mjs').then(m => ({ type: 'lang' as const, value: m.default })),
      import('shiki/dist/langs/json.mjs').then(m => ({ type: 'lang' as const, value: m.default })),
      import('shiki/dist/langs/yaml.mjs').then(m => ({ type: 'lang' as const, value: m.default })),
      import('shiki/dist/langs/astro.mjs').then(m => ({ type: 'lang' as const, value: m.default })),
    )
  }

  const results = await Promise.all(promises)
  for (const result of results) {
    if (result.type === 'theme') themes.push(result.value)
    else languages.push(result.value)
  }
  // Remove custom language after updating language in shiki core
  languages.push(comakLanguage as LanguageRegistration)

  return { themes, languages }
}

async function loadTheme(hl: ShikiPrimitive, theme: ThemeRegistration) {
  if (loadedThemes.has(theme.name || '')) {
    return
  }
  await hl.loadTheme(theme)
  loadedThemes.add(theme.name || '')
}

async function loadLanguage(hl: ShikiPrimitive, language: LanguageRegistration | LanguageRegistration[]) {
  if (loadedLanguages.has(Array.isArray(language) ? language.map(l => l.name || '').join(',') : language.name || '')) {
    return
  }
  await hl.loadLanguage(language)
  loadedLanguages.add(Array.isArray(language) ? language.map(l => l.name || '').join(',') : language.name || '')
}

/**
 * Convert a hast (HTML AST) node into a ComarkNode.
 * Uses pre-allocated arrays to avoid spread overhead.
 */
function hastToComarkNode(input: any): ComarkNode {
  if (input.type === 'text') return input.value
  if (input.type === 'comment') return [null, {}, input.value]

  const props = input.properties || {}
  if (input.tag === 'code' && props?.className && props.className.length === 0) {
    delete props.className
  }

  const children = input.children
  if (!children || children.length === 0) return [input.tagName, props]
  const len = children.length
  // eslint-disable-next-line unicorn/no-new-array -- pre-allocated for perf
  const result = new Array(len + 2)
  result[0] = input.tagName
  result[1] = props
  for (let i = 0; i < len; i++) {
    result[i + 2] = hastToComarkNode(children[i])
  }
  return result as ComarkNode
}

/**
 * Apply syntax highlighting to all code blocks in a Comark tree
 * Uses codeToTokens API with batched async operations
 */
export async function highlightCodeBlocks(tree: ComarkTree, options: HighlightOptions = {}): Promise<ComarkTree> {
  interface CodeBlockRef { node: ComarkNode, path: number[] }

  const codeBlocks: CodeBlockRef[] = []
  const pathBuf: number[] = []

  // Recursively find <pre><code> blocks, tracking their path via push/pop on a shared buffer
  const walkChildren = (element: ComarkElement): void => {
    for (let i = 2; i < element.length; i++) {
      const child = element[i]
      if (typeof child === 'string') continue
      if (!Array.isArray(child) || child.length < 3) continue
      pathBuf.push(i - 2)
      if (child[0] === 'pre' && Array.isArray(child[2]) && child[2][0] === 'code') {
        const codeContent = child[2][2]
        if (typeof codeContent === 'string') {
          codeBlocks.push({ node: child, path: pathBuf.slice() })
        }
      }
      walkChildren(child as ComarkElement)
      pathBuf.pop()
    }
  }

  for (let i = 0; i < tree.nodes.length; i++) {
    const node = tree.nodes[i]
    if (typeof node === 'string') continue
    if (!Array.isArray(node) || node.length < 3) continue
    if (node[0] === 'pre' && Array.isArray(node[2]) && node[2][0] === 'code') {
      const codeContent = node[2][2]
      if (typeof codeContent === 'string') {
        codeBlocks.push({ node, path: [i] })
      }
    }
    pathBuf.length = 1
    pathBuf[0] = i
    walkChildren(node as ComarkElement)
  }

  if (codeBlocks.length === 0) return tree

  const hl = await getHighlighter(options)
  const { themes = { light: 'material-theme-lighter', dark: 'material-theme-palenight' } } = options
  const lightTheme = themes.light || themes.dark || 'material-theme-lighter'
  const darkTheme = themes.dark || themes.light || 'material-theme-palenight'
  const themeOptions = {
    light: lightTheme,
    dark: lightTheme !== darkTheme ? darkTheme : undefined,
  }

  // eslint-disable-next-line unicorn/no-new-array -- pre-allocated for perf
  const highlightedResults: Array<{ nodes: ComarkNode[], language: string }> = new Array(codeBlocks.length)
  for (let i = 0; i < codeBlocks.length; i++) {
    const { node } = codeBlocks[i]
    const code = (node[2] as any)[2] as string
    const attrs = node[1] as CodeBlockAttributes
    const language: string = (attrs as any)?.language
    try {
      const result = codeToHast(hl, code, {
        lang: language,
        transformers: options.transformers,
        themes: themeOptions,
        meta: {
          __raw: attrs.meta,
        },
      })
      highlightedResults[i] = {
        nodes: result.children.map(hastToComarkNode) as ComarkNode[],
        language,
      }
    }
    catch {
      highlightedResults[i] = { nodes: [code], language }
    }
  }

  const darkClassSuffix = options.themes?.dark?.name ? ` dark:${options.themes.dark.name}` : ''

  // Build new nodes array, spine-copying only paths to modified <pre> nodes
  const newNodes = [...tree.nodes] as ComarkNode[]
  for (let i = 0; i < codeBlocks.length; i++) {
    const { node, path } = codeBlocks[i]
    const preAttrs = node[1] as Record<string, any>
    const result = highlightedResults[i]

    const preNode = result.nodes[0]
    let classStr: string
    if (typeof preNode === 'string') {
      classStr = 'shiki' + (options.themes?.light?.name ? ` ${options.themes.light.name}` : '')
    }
    else {
      const cls = (preNode[1] as ComarkElementAttributes).class
      classStr = Array.isArray(cls) ? cls.join(' ') : String(cls)
    }
    if (darkClassSuffix) classStr += darkClassSuffix

    const codeChildren = typeof preNode === 'string'
      ? preNode
      : (preNode[2] as ComarkElement).slice(2) as ComarkNode[]

    if (Array.isArray(codeChildren)) {
      const highlightSet = Array.isArray(preAttrs.highlights) ? new Set<number>(preAttrs.highlights) : null
      let line = 1
      for (const child of codeChildren) {
        if (Array.isArray(child)) {
          if (highlightSet !== null && highlightSet.has(line)) {
            child[1].class = `${child[1].class ?? ''} highlight`.trim()
            // TODO: (enforcing default style) once we unify all ecosystem styles we can remove this
            child[1].style = 'display: inline-block'
          }
          else {
            // TODO: (enforcing default style) once we unify all ecosystem styles we can remove this
            child[1].style = 'display: inline'
          }

          line += 1
        }
      }
    }

    const newPreAttrs: Record<string, any> = {
      ...preAttrs,
      class: classStr,
      tabindex: '0',
    }

    if (options.preStyles) {
      const lightTheme = options.themes?.light
      const darkTheme = options.themes?.dark
      const styles: string[] = []

      if (lightTheme?.colors?.['editor.background']) {
        styles.push(`background-color:${lightTheme.colors['editor.background']}`)
      }
      if (lightTheme?.colors?.['editor.foreground']) {
        styles.push(`color:${lightTheme.colors['editor.foreground']}`)
      }
      if (lightTheme?.name !== darkTheme?.name) {
        if (darkTheme?.colors?.['editor.background']) {
          styles.push(`--shiki-dark-bg:${darkTheme.colors['editor.background']}`)
        }
        if (darkTheme?.colors?.['editor.foreground']) {
          styles.push(`--shiki-dark:${darkTheme.colors['editor.foreground']}`)
        }
      }
      newPreAttrs.style = styles.join(';')
    }

    const codeEl = node[2] as ComarkElement
    const codeAttrs = (codeEl[1] as Record<string, any>) || {}
    let newPreNode: ComarkNode
    if (Array.isArray(codeChildren)) {
      // eslint-disable-next-line unicorn/no-new-array -- pre-allocated for perf
      const codeNode = new Array(codeChildren.length + 2) as ComarkElement
      codeNode[0] = 'code'
      codeNode[1] = codeAttrs
      for (let j = 0; j < codeChildren.length; j++) codeNode[j + 2] = codeChildren[j]
      newPreNode = ['pre', newPreAttrs, codeNode]
    }
    else {
      newPreNode = ['pre', newPreAttrs, ['code', codeAttrs, codeChildren]]
    }

    if (path.length === 1) {
      newNodes[path[0]] = newPreNode
    }
    else {
      // Copy only the spine from root to this node to preserve immutability
      const rootIdx = path[0]
      let current = [...(newNodes[rootIdx] as ComarkElement)] as ComarkElement
      newNodes[rootIdx] = current
      for (let j = 1; j < path.length - 1; j++) {
        const childSlot = path[j] + 2
        const next = [...(current[childSlot] as ComarkElement)] as ComarkElement
        current[childSlot] = next
        current = next
      }
      const childSlot = path[path.length - 1] + 2
      current[childSlot] = newPreNode
    }
  }

  return { ...tree, nodes: newNodes }
}

/**
 * Reset the highlighter instance
 * Useful for testing or when you want to reconfigure
 */
export function resetHighlighter(): void {
  highlighter = null
  highlighterPromise = null
  loadedThemes.clear()
}

export default defineComarkPlugin<HighlightOptions>((options: HighlightOptions = {}) => ({
  name: 'highlight',
  async post(state) {
    state.tree = await highlightCodeBlocks(state.tree, options)
  },
}))

import type { LanguageRegistration } from 'shiki'
import type { ComarkElement, ComarkNode, ComarkTree, ComarkPlugin, ComarkElementAttributes } from 'comark'
import type { ShikiPrimitive, ThemeRegistration } from '@shikijs/primitive'
import { createShikiPrimitive } from '@shikijs/primitive'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'
import type { ShikiTransformer } from '@shikijs/types'
import { codeToHast } from 'shiki/core'

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
  // If highlighter exists, load any new themes that aren't loaded yet
  if (highlighter) {
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
          md: 'mdc',
          markdown: 'mdc',
          comark: 'mdc',
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
      import('@shikijs/themes/material-theme-lighter').then(m => ({ type: 'theme' as const, value: m.default })),
      import('@shikijs/themes/material-theme-palenight').then(m => ({ type: 'theme' as const, value: m.default })),
    )
  }
  if (options.registerDefaultLanguages !== false) {
    promises.push(
      import('@shikijs/langs/vue').then(m => ({ type: 'lang' as const, value: m.default })),
      import('@shikijs/langs/tsx').then(m => ({ type: 'lang' as const, value: m.default })),
      import('@shikijs/langs/svelte').then(m => ({ type: 'lang' as const, value: m.default })),
      import('@shikijs/langs/typescript').then(m => ({ type: 'lang' as const, value: m.default })),
      import('@shikijs/langs/javascript').then(m => ({ type: 'lang' as const, value: m.default })),
      import('@shikijs/langs/mdc').then(m => ({ type: 'lang' as const, value: m.default })),
      import('@shikijs/langs/bash').then(m => ({ type: 'lang' as const, value: m.default })),
      import('@shikijs/langs/json').then(m => ({ type: 'lang' as const, value: m.default })),
      import('@shikijs/langs/yaml').then(m => ({ type: 'lang' as const, value: m.default })),
      import('@shikijs/langs/astro').then(m => ({ type: 'lang' as const, value: m.default })),
    )
  }

  const results = await Promise.all(promises)
  for (const result of results) {
    if (result.type === 'theme') themes.push(result.value)
    else languages.push(result.value)
  }

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
 * Highlight code using Shiki with codeToTokens
 * Returns comark nodes built from hast
 */
export async function highlightCode(code: string, attrs: CodeBlockAttributes, options: HighlightOptions = {}): Promise<{ nodes: ComarkNode[], language: string, bgColor?: string, fgColor?: string }> {
  // Extract language from attributes
  const language: string = (attrs as any)?.language
  try {
    const hl = await getHighlighter(options)
    const { themes = { light: 'material-theme-lighter', dark: 'material-theme-palenight' } } = options

    const lightTheme = themes.light || themes.dark || 'material-theme-lighter'
    const darkTheme = themes.dark || themes.light || 'material-theme-palenight'
    // Use codeToTokens to get raw tokens
    const result = await codeToHast(hl, code, {
      lang: language,
      transformers: options.transformers,
      themes: {
        light: lightTheme,
        dark: lightTheme !== darkTheme ? darkTheme : undefined,
      },
      meta: {
        __raw: attrs.meta,
      },
    })
    const allTokens = result.children.map(hastToMinimarkNode) as ComarkNode[]

    return {
      nodes: allTokens,
      language,
    }
  }
  catch (error) {
    // If highlighting fails, return the original code
    console.error('Shiki highlighting error:', error)
    return {
      nodes: [code],
      language,
    }
  }

  function hastToMinimarkNode(input: any) {
    const props = input.properties || {}
    if (input.type === 'comment') return [null, {}, input.value]
    if (input.type === 'text') return input.value
    if (input.tag === 'code' && props?.className && props.className.length === 0) delete props.className
    return [
      input.tagName,
      props,
      ...(input.children || []).map(hastToMinimarkNode),
    ]
  }
}

/**
 * Apply syntax highlighting to all code blocks in a Comark tree
 * Uses codeToTokens API with batched async operations
 */
export async function highlightCodeBlocks(
  tree: ComarkTree,
  options: HighlightOptions = {},
): Promise<ComarkTree> {
  interface CodeBlockRef { node: ComarkNode, path: number[] }

  const codeBlocks: CodeBlockRef[] = []

  const findCodeBlocks = (nodes: ComarkNode[], path: number[]): void => {
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i]
      if (typeof node === 'string') continue
      if (!Array.isArray(node) || node.length < 3) continue

      if (node[0] === 'pre' && Array.isArray(node[2]) && node[2][0] === 'code') {
        const codeContent = node[2][2]
        if (typeof codeContent === 'string') {
          codeBlocks.push({ node, path: [...path, i] })
        }
      }

      findCodeBlocks(node.slice(2) as ComarkNode[], [...path, i])
    }
  }
  findCodeBlocks(tree.nodes, [])

  if (codeBlocks.length === 0) return tree

  const highlightedResults = await Promise.all(
    codeBlocks.map(({ node }) => {
      return highlightCode((node[2] as any)[2] as string, node[1] as CodeBlockAttributes, options)
    }),
  )

  const newNodes = JSON.parse(JSON.stringify(tree.nodes)) as ComarkNode[]
  for (let i = 0; i < codeBlocks.length; i++) {
    const { node, path } = codeBlocks[i]
    const result = highlightedResults[i]

    const preNode = result.nodes[0]
    const preNodeClasses = typeof preNode === 'string'
      ? ['shiki', options.themes?.light?.name]
      : (
          Array.isArray((preNode[1] as ComarkElementAttributes).class)
            ? (preNode[1] as ComarkElementAttributes).class as string[]
            : String((preNode[1] as ComarkElementAttributes).class).split(' ')
        )

    const codeChildren = preNode[2].slice(2) as ComarkNode[]
    const children = typeof preNode === 'string' ? preNode : codeChildren.filter(element => element !== '\n')

    const preAttrs = node[1] as Record<string, any>
    const newPreAttrs: Record<string, any> = {
      ...preAttrs,
      class: [...preNodeClasses, options.themes?.dark?.name ? `dark:${options.themes?.dark?.name}` : ''].filter(Boolean).join(' '),
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
    const newPreNode: ComarkNode = ['pre', newPreAttrs, ['code', codeAttrs, ...children]]

    if (path.length === 1) {
      newNodes[path[0]] = newPreNode
    }
    else {
      let current = newNodes[path[0]] as ComarkElement
      for (let j = 1; j < path.length - 1; j++) {
        current = current[path[j] + 2] as ComarkElement
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

export default function highlight(options: HighlightOptions = {}): ComarkPlugin {
  return {
    name: 'highlight',
    async post(state) {
      state.tree = await highlightCodeBlocks(state.tree, options)
    },
  }
}

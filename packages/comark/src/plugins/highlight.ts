import type { LanguageRegistration } from 'shiki'
import type { ComarkElement, ComarkNode, ComarkTree, ComarkPlugin } from 'comark'
import type { ShikiPrimitive, ThemedToken, ThemedTokenWithVariants, ThemeRegistration } from '@shikijs/primitive'
import { createShikiPrimitive, codeToTokensWithThemes } from '@shikijs/primitive'
import { createJavaScriptRegexEngine } from 'shiki/engine/javascript'

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
   * Whether to add pre styles to the code blocks
   * @default false
   */
  preStyles?: boolean
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

/**
 * Convert color to inline style
 */
function colorToStyle(token: ThemedTokenWithVariants | ThemedToken | undefined): string | undefined {
  if (!token) return undefined

  const variants = (token as ThemedTokenWithVariants).variants
  if (!variants) return `color:${(token as ThemedToken).color}`

  const { light: lc, dark: dc } = variants
  if (!lc?.color || !dc?.color) return undefined
  return lc.color === dc.color ? `color:${lc.color}` : `color:${lc.color};--shiki-dark:${dc.color}`
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
    const langs = ['vue', 'tsx', 'svelte', 'typescript', 'javascript', 'mdc', 'bash', 'json', 'yaml']
    for (const lang of langs) {
      promises.push(
        import(`@shikijs/langs/${lang}`).then(m => ({ type: 'lang' as const, value: m.default })),
      )
    }
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
 * Returns comark nodes built from tokens
 */
export async function highlightCode(
  code: string,
  attrs: { language?: string, class?: string, highlights?: number[] },
  options: HighlightOptions = {},
): Promise<{ nodes: ComarkNode[], language: string, bgColor?: string, fgColor?: string }> {
  // Extract language from attributes
  const language: string = (attrs as any)?.language
  try {
    const hl = await getHighlighter(options)
    const { themes = { light: 'material-theme-lighter', dark: 'material-theme-palenight' } } = options

    // Use codeToTokens to get raw tokens
    const result = codeToTokensWithThemes(hl, code, {
      lang: language,
      themes: {
        light: themes.light || themes.dark || 'material-theme-lighter',
        dark: themes.dark || themes.light || 'material-theme-palenight',
      },
    })

    // Build comark nodes from tokens (flatten all lines)
    const allTokens: ComarkNode[] = Array.from({ length: result.length })
    const highlights = attrs.highlights

    for (let i = 0; i < result.length; i++) {
      const lineTokens = result[i]
      const children: ComarkNode[] = Array.from({ length: lineTokens.length })
      for (let j = 0; j < lineTokens.length; j++) {
        const token = lineTokens[j]
        const style = colorToStyle(token)
        children[j] = style ? ['span', { style }, token.content] : token.content
      }
      const lineClass = 'line' + (highlights?.includes(i + 1) ? ' highlight' : '')
      allTokens[i] = ['span', { class: lineClass }, ...children]
    }

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
      const attrs = node[1] as { language?: string, class?: string, highlights?: number[] }
      const codeContent = (node[2] as any)[2] as string
      return highlightCode(codeContent, attrs, options)
    }),
  )

  const newNodes = JSON.parse(JSON.stringify(tree.nodes)) as ComarkNode[]
  for (let i = 0; i < codeBlocks.length; i++) {
    const { node, path } = codeBlocks[i]
    const result = highlightedResults[i]
    const { nodes } = result

    const preAttrs = node[1] as Record<string, any>
    const newPreAttrs: Record<string, any> = {
      ...preAttrs,
      class: ['shiki', options.themes?.light?.name, options.themes?.dark?.name ? `dark:${options.themes?.dark?.name}` : ''].filter(Boolean).join(' '),
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
    const newPreNode: ComarkNode = ['pre', newPreAttrs, ['code', codeAttrs, ...nodes]]

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

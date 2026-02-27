import type { BundledLanguage, BundledTheme, LanguageRegistration } from 'shiki'
import type { ComarkNode, ComarkTree } from 'comark/ast'
import type { ComarkPlugin } from '../types'
import type { ShikiPrimitive, ThemedTokenWithVariants, ThemeRegistration } from '@shikijs/primitive'
import { createShikiPrimitive, codeToTokensWithThemes } from '@shikijs/primitive'
import {createJavaScriptRegexEngine} from 'shiki/engine/javascript'


export interface HighlightOptions {
  /**
   * Whether to use the default language definitions
   * @default false
   */
  registerDefaultLanguages?: boolean

  /**
   * Whether to use the default theme definitions
   * @default false
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
    highlighterPromise = (async() => {
      const { themes, languages } = await registerDefaults(options)
      const hl = createShikiPrimitive({
        themes: themes,
        langs: languages,
        engine: createJavaScriptRegexEngine({ forgiving: true }),
      })

      await Promise.all(themes.map(theme => loadTheme(hl, theme)))
      await Promise.all(languages.map(language => loadLanguage(hl, language)))

      return hl;
    })() as Promise<ShikiPrimitive>;

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
function colorToStyle(token: ThemedTokenWithVariants | undefined): string | undefined {
  if (!token) return undefined

  return `color:${token.variants.light.color};--shiki-dark:${token.variants.dark.color}`
}

async function registerDefaults(options: HighlightOptions) {
  const themes = Object.values(options.themes || {}) as ThemeRegistration[]
  const languages = options.languages || [] as Array<LanguageRegistration | LanguageRegistration[]>
  if (options.registerDefaultThemes !== false) {
    themes.push(await import('@shikijs/themes/material-theme-lighter').then(m => m.default))
    themes.push(await import('@shikijs/themes/material-theme-palenight').then(m => m.default))
  }
  if (options.registerDefaultLanguages !== false) {
    languages.push(await import('@shikijs/langs/vue').then(m => m.default))
    languages.push(await import('@shikijs/langs/typescript').then(m => m.default))
    languages.push(await import('@shikijs/langs/javascript').then(m => m.default))
    languages.push(await import('@shikijs/langs/mdc').then(m => m.default))
    languages.push(await import('@shikijs/langs/tsx').then(m => m.default))
    languages.push(await import('@shikijs/langs/bash').then(m => m.default))
    languages.push(await import('@shikijs/langs/json').then(m => m.default))
    languages.push(await import('@shikijs/langs/yaml').then(m => m.default))
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

    // Load the language if not already loaded
    const loadedLanguages = hl.getLoadedLanguages()
    if (!loadedLanguages.includes(language as BundledLanguage)) {
      // Language not supported, return plain code
      return {
        nodes: [code],
        language,
      }
    }

    // Use codeToTokens to get raw tokens
    const result = codeToTokensWithThemes(hl, code, {
      lang: language,
      themes,
    })

    // Build comark nodes from tokens (flatten all lines)
    const allTokens: ComarkNode[] = []

    for (let i = 0; i < result.length; i++) {
      const lineTokens = result[i]

      const lineTokensNodes: ComarkNode[] = []
      for (const token of lineTokens) {
        const style = colorToStyle(token)

        // Create a span with style for colored tokens
        // Note: we always wrap in spans if there's a style, even for whitespace
        // because the whitespace may be part of the styled token
        if (style) {
          lineTokensNodes.push(['span', { style }, token.content] as ComarkNode)
        }
        else {
          // Plain text token (no style)
          lineTokensNodes.push(token.content)
        }
      }

      const lineClass = 'line' + (attrs.highlights?.includes(i + 1) ? ' highlight' : '')
      allTokens.push(['span', { class: lineClass }, ...lineTokensNodes])

      // Add newline between lines (except for last line)
      if (i < result.length - 1) {
        allTokens.push('\n')
      }
    }

    return {
      nodes: allTokens,
      language
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
 * Uses codeToTokens API
 */
export async function highlightCodeBlocks(
  tree: ComarkTree,
  options: HighlightOptions = {},
): Promise<ComarkTree> {
  const processNode = async (node: ComarkNode): Promise<ComarkNode> => {
    // Skip text nodes
    if (typeof node === 'string') {
      return node
    }

    // Check if this is a pre > code structure
    if (Array.isArray(node) && node[0] === 'pre') {
      const [_tag, attrs, ...children] = node
      // Look for code element as child
      if (children.length > 0 && Array.isArray(children[0]) && children[0][0] === 'code') {
        const codeNode = children[0]
        const [, codeAttrs, content] = codeNode

        if (typeof content === 'string') {
          try {
            const { nodes, bgColor, fgColor } = await highlightCode(content, attrs, options)

            // Build pre attributes with Shiki styling
            const newPreAttrs: any = {
              ...attrs,
              class: `shiki ${options.themes?.light}`,
              tabindex: '0',
            }

            if (options.preStyles && (bgColor || fgColor)) {
              const styles: string[] = []
              if (bgColor) styles.push(`background-color:${bgColor}`)
              if (fgColor) styles.push(`color:${fgColor}`)
              newPreAttrs.style = styles.join(';')
            }

            // Return the updated pre > code structure with token-based children
            return ['pre', newPreAttrs, ['code', codeAttrs || {}, ...nodes]] as ComarkNode
          }
          catch (error) {
            console.error('Failed to highlight code block:', error)
            // Keep original node if highlighting fails
          }
        }
      }
    }

    // Recursively process children
    if (Array.isArray(node)) {
      const [tag, attrs, ...children] = node
      const processedChildren = await Promise.all(
        children.map(child => processNode(child)),
      )
      return [tag, attrs, ...processedChildren] as ComarkNode
    }

    return node
  }

  const processedValue = await Promise.all(
    tree.nodes.map(node => processNode(node)),
  )

  return {
    ...tree,
    nodes: processedValue,
  }
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
    async post(state) {
      state.tree = await highlightCodeBlocks(state.tree, options)
    },
  }
}

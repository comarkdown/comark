import type { Highlighter, BundledLanguage, BundledTheme } from 'shiki'
import type { ComarkNode, ComarkTree } from 'comark/ast'
import type { ComarkPlugin } from '../types'

export interface HighlightOptions {
  /**
   * Languages to preload. If not specified, languages will be loaded on demand.
   * @default undefined (load on demand)
   */
  languages?: BundledLanguage[]

  /**
   * Additional themes to preload
   * @default { light: 'material-theme-lighter', dark: 'material-theme-palenight' }
   */
  themes?: Record<string, BundledTheme | string>

  /**
   * Whether to add pre styles to the code blocks
   * @default false
   */
  preStyles?: boolean
}

let highlighter: Highlighter | null = null
let highlighterPromise: Promise<Highlighter> | null = null
const loadedThemes: Set<string> = new Set()

/**
 * Get or create the Shiki highlighter instance
 * Uses a singleton pattern to avoid creating multiple highlighters
 */
export async function getHighlighter(options: HighlightOptions = {}): Promise<Highlighter> {
  const { themes = {}, languages } = options
  const allThemes = ['material-theme-lighter', 'material-theme-palenight', ...Object.values(themes)].filter(Boolean) as (BundledTheme | string)[]

  // If highlighter exists, load any new themes that aren't loaded yet
  if (highlighter) {
    const themesToLoad = allThemes.filter(t => !loadedThemes.has(t))
    if (themesToLoad.length > 0) {
      await Promise.all(themesToLoad.map(async (t) => {
        try {
          await loadTheme(highlighter!, t)
        }
        catch (error) {
          console.warn(`Failed to load theme ${t}:`, error)
        }
      }))
    }
    return highlighter
  }

  if (highlighterPromise) {
    return highlighterPromise
  }

  try {
    const createJavaScriptRegexEngine = await import('shiki/engine/javascript').then(m => m.createJavaScriptRegexEngine)
    const createHighlighter = await import('shiki').then(m => m.createHighlighter)

    const engine = createJavaScriptRegexEngine({ forgiving: true })

    highlighterPromise = createHighlighter({
      themes: allThemes,
      langs: languages || [],
      engine,
    })

    highlighter = await highlighterPromise
    highlighterPromise = null

    // Track loaded themes
    allThemes.forEach(t => loadedThemes.add(t))

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
function colorToStyle(color: Record<string, string> | undefined): string | undefined {
  if (!color) return undefined
  return Object.entries(color).map(([key, value]) => `${key}:${value}`).join(';')
}

async function loadTheme(hl: Highlighter, theme: string) {
  if (loadedThemes.has(theme)) {
    return
  }
  await hl.loadTheme(theme as BundledTheme)
  loadedThemes.add(theme)
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
  const language = (attrs as any)?.language
  try {
    const hl = await getHighlighter(options)
    const { themes = { light: 'material-theme-lighter', dark: 'material-theme-palenight' } } = options

    if (themes.light)
      await loadTheme(hl, themes.light)
    if (themes.dark)
      await loadTheme(hl, themes.dark)
    // Load the language if not already loaded
    const loadedLanguages = hl.getLoadedLanguages()
    if (!loadedLanguages.includes(language as BundledLanguage)) {
      try {
        await hl.loadLanguage(language as BundledLanguage)
      }
      catch {
        // Language not supported, return plain code
        return {
          nodes: [code],
          language,
        }
      }
    }

    // Use codeToTokens to get raw tokens
    const result = hl.codeToTokens(code, {
      lang: language as BundledLanguage,
      themes: themes as Record<string, BundledTheme | string>,
    })

    // Build comark nodes from tokens (flatten all lines)
    const allTokens: ComarkNode[] = []

    for (let i = 0; i < result.tokens.length; i++) {
      const lineTokens = result.tokens[i]

      const lineTokensNodes: ComarkNode[] = []
      for (const token of lineTokens) {
        const style = colorToStyle(token.htmlStyle)

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
      if (i < result.tokens.length - 1) {
        allTokens.push('\n')
      }
    }

    return {
      nodes: allTokens,
      language,
      bgColor: result.bg,
      fgColor: result.fg,
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

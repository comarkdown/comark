import type { ElementNodeAttributes } from 'comark'

/**
 * Fragment languages: a name authors write in `{lang="…"}` mapped onto a real
 * grammar plus source that seeds the grammar state and is then discarded.
 * Named after the `@nuxtjs/mdc` conventions so `ts-type` and `vue-html` keep
 * working for sites migrating off it. Shared by the Shiki and rangi plugins.
 */
export const GRAMMAR_CONTEXTS = new Map<string, { lang: string; grammarContextCode: string }>([
  ['ts-type', { lang: 'typescript', grammarContextCode: 'let a:' }],
  ['vue-html', { lang: 'vue', grammarContextCode: '<template>' }],
])

/**
 * Read the language an inline `<code>` declares. `lang` wins over `language`:
 * `lang` is what authors type, `language` is what the fence path already uses.
 */
export function inlineCodeLanguage(attrs: ElementNodeAttributes): string | undefined {
  const raw = attrs?.lang ?? attrs?.language
  if (typeof raw !== 'string') return undefined
  return raw.trim() || undefined
}

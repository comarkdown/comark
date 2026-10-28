import { stringifyYaml } from '../yaml.ts'
import { pickFence } from './fence.ts'

export { resolveAttributes, resolveAttribute, htmlAttributes } from './html-attributes.ts'
export type { ResolveAttributesOptions } from './html-attributes.ts'

// Implicit attributes the parser injects per tag — they're conveyed by the
// native markdown syntax (e.g. `as` becomes `> [!NOTE]`, `task-list-item`
// is implicit in `- [ ]`) so they should not echo back as user attrs.
const IMPLICIT_ATTRS: Record<string, { drop?: string[]; classBlocklist?: string[] }> = {
  blockquote: { drop: ['as'] },
  ol: { drop: ['start'] },
  ul: { classBlocklist: ['contains-task-list'] },
  li: { classBlocklist: ['task-list-item'] },
  // `language`/`filename`/`highlights`/`meta` ride on the fence info string.
  // `style` comes from render-time plugins (e.g. shiki / rangi) and has no
  // markdown form. `class` is handled specially in userBlockAttrs because
  // highlighters merge their injected classes with the user's class — we need
  // to strip just the highlighter portion. Highlighted inline `<code>` goes
  // through the same `class` handling, with no implicit attrs of its own.
  pre: { drop: ['language', 'filename', 'highlights', 'meta', 'style'] },
}

/**
 * Filter implicit/auto-generated attrs that are encoded by the native
 * markdown syntax and shouldn't echo back as `{attr=...}`. Used by the
 * block stringifiers to decide whether a node has *user* attrs that must
 * be preserved via the `::tag{...}` wrapper form.
 */
export function userBlockAttrs(tag: string, attributes: Record<string, unknown>): Record<string, unknown> {
  const rule = IMPLICIT_ATTRS[tag]
  // A highlighter takes over the `class` of a fenced block's `<pre>` and of
  // inline `<code>` alike, so both need the class handling below.
  const highlighted = tag === 'pre' || tag === 'code'
  if (!rule && !highlighted) return { ...attributes }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attributes)) {
    if (rule?.drop?.includes(key)) continue
    if (key === 'class' && rule?.classBlocklist && typeof value === 'string') {
      const remaining = value
        .split(/\s+/)
        .filter((c) => c && !rule!.classBlocklist!.includes(c))
        .join(' ')
      if (remaining) result[key] = remaining
      continue
    }
    if (
      key === 'class' &&
      highlighted &&
      typeof value === 'string' &&
      (value.startsWith('shiki') || value.startsWith('shj'))
    ) {
      // Highlighters inject their own classes (`shiki …` / `shj shj-lang-…`)
      // and append any user class after a `.` separator. Recover the user
      // portion by dropping everything up to and including that separator.
      const tokens = value.split(/\s+/)
      const cutoff = tokens.findIndex((t) => t === '.')

      const userClass = cutoff >= 0 ? tokens.slice(cutoff + 1).join(' ') : ''
      if (userClass) result[key] = userClass
      continue
    }
    result[key] = value
  }
  return result
}

/**
 * Convert attributes to a string of Comark attributes
 *
 * @param attributes - The attributes to stringify
 * @returns The stringified attributes
 */
export function comarkAttributes(attributes: Record<string, unknown>) {
  const attrs = Object.entries(attributes)
    .map(([key, value]) => {
      if (key.startsWith(':') && value === 'true') {
        return key.slice(1)
      }
      if (key === 'id') {
        return `#${value}`
      }
      if (key === 'class') {
        // The parser JSON-decodes `[...]`/`{...}` attribute values, so class
        // can be an array/object here — normalize instead of crashing on
        // value.split.
        const classValue = Array.isArray(value) ? value.join(' ') : String(value)
        return classValue
          .split(' ')
          .filter(Boolean)
          .map((c) => `.${c}`)
          .join('')
      }

      if (typeof value === 'object') {
        return `${key}="${JSON.stringify(value).replace(/"/g, '\\"')}"`
      }

      const str = String(value)
      // A double quote inside a double-quoted value would terminate it early,
      // letting the remainder become new attributes on re-parse. Single
      // quotes round-trip cleanly when the value has no single quote;
      // otherwise backslash-escape (the parser skips \" without terminating —
      // safe, though it keeps the backslash in the value).
      if (str.includes('"') && !str.includes("'")) {
        return `${key}='${str}'`
      }
      return `${key}="${str.replace(/"/g, '\\"')}"`
    })
    .join(' ')

  return attrs.length > 0 ? `{${attrs}}` : ''
}

// Coerce string `'true'`/`'false'` (how inline `{attr}` parsing stores
// boolean-like attrs) to native booleans so js-yaml v5 emits them unquoted.
function normalizeValue(value: unknown): unknown {
  if (value === 'true') return true
  if (value === 'false') return false
  return value
}

/**
 * Convert attributes to a string of YAML attributes
 *
 * @param attributes - The attributes to stringify
 * @returns The stringified attributes
 */
export function comarkYamlAttributes(
  attributes: Record<string, unknown>,
  style: 'frontmatter' | 'codeblock' = 'codeblock'
) {
  // Normalize attribute values for YAML serialization:
  //  - `:`-prefixed JSON literals (`:count="42"`, `:config={…}`) restore to
  //    native values and drop the prefix — matching @nuxtjs/mdc stringify.
  //  - `:`-prefixed path bindings (`:to="$doc.link"`) stay prefixed so they
  //    round-trip as bindings, not plain strings.
  //  - Bare string literals `'true'`/`'false'` from inline attrs coerce to bools.
  const normalized = Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => {
      if (key.startsWith(':')) {
        if (typeof value === 'string') {
          try {
            // JSON number/boolean/null/object/array → typed YAML key without `:`
            return [key.slice(1), JSON.parse(value)]
          } catch {
            // Path binding / non-JSON string — keep the `:` key
            return [key, value]
          }
        }
        // Already-decoded object/array (processAttributes) or native value
        return [key.slice(1), value]
      }
      return [key, normalizeValue(value)]
    })
  )

  const yamlContent = stringifyYaml(normalized).trim()

  if (style === 'frontmatter') {
    return `---\n${yamlContent}\n---`
  }

  const fence = pickFence(yamlContent)
  return `${fence}yaml [props]\n${yamlContent}\n${fence}`
}

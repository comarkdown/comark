import { stringifyYaml } from '../yaml.ts'
import { get } from '../../utils/index.ts'
import type { NodeRenderData } from '../../types.ts'

export interface ResolveAttributesOptions {
  /**
   * When true, every `:prefixed` string value is JSON-parsed first and the
   * `:` prefix is always stripped. Non-JSON strings fall back to a dot-path
   * lookup in `renderData`; unresolved paths yield `undefined`.
   *
   * This matches the Vue/React/Svelte renderer semantics, which always
   * normalize bindings into real JS values suitable for typed component props.
   *
   * When false (default) only dot-path lookups are applied — literals and
   * unresolved paths are preserved verbatim so string-based serializers
   * (like HTML attribute emitters) can apply their own `:prefix` handling.
   */
  parseJson?: boolean
}

/**
 * Resolve `:prefixed` attributes against the render context.
 *
 * Default behavior: a `:prefixed` string value that matches a dot-path in
 * `{ frontmatter, meta, data, props }` is replaced with the resolved value
 * (and the `:` prefix is stripped). Anything that doesn't resolve — literals
 * like `"5"` / `"true"`, unknown paths, or already-parsed object values — is
 * left untouched and keeps its `:` prefix.
 *
 * With `parseJson: true`, every `:prefixed` string is JSON-parsed first and
 * the `:` prefix is always stripped, falling back to the dot-path lookup.
 * The `$` metadata key is never forwarded.
 */
export function resolveAttributes(
  attrs: Record<string, unknown>,
  renderData: NodeRenderData,
  options: ResolveAttributesOptions = {}
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  for (const key in attrs) {
    if (key === '$') continue

    const value = attrs[key]
    const isBinding = key.charCodeAt(0) === 58 /* ':' */

    if (options.parseJson && isBinding) {
      // Framework mode: always strip `:` and hand components real JS values.
      if (typeof value === 'string') {
        try {
          result[key.slice(1)] = JSON.parse(value)
          continue
        } catch {
          // not JSON — fall through to dot-path lookup
        }
        result[key.slice(1)] = get(renderData, value)
        continue
      }
      // Non-string binding value (e.g. an object literal the parser already
      // decoded) — pass through with the prefix stripped.
      result[key.slice(1)] = value
      continue
    }

    if (isBinding && typeof value === 'string') {
      const resolved = get(renderData, value)
      if (resolved !== undefined) {
        result[key.slice(1)] = resolved
        continue
      }
    }

    result[key] = value
  }
  return result
}

/**
 * Read a named attribute, preferring its `:prefixed` binding (resolved against
 * `renderData`) over the literal `key`. Falls back to the raw value when the
 * binding doesn't resolve.
 */
export function resolveAttribute(attrs: Record<string, unknown>, renderData: NodeRenderData, key: string): unknown {
  const bindKey = `:${key}`
  if (bindKey in attrs) {
    const value = attrs[bindKey]
    if (typeof value === 'string') {
      const resolved = get(renderData, value)
      if (resolved !== undefined) return resolved
    }
    return value
  }
  return attrs[key]
}

// Implicit attributes the parser injects per tag — they're conveyed by the
// native markdown syntax (e.g. `as` becomes `> [!NOTE]`, `task-list-item`
// is implicit in `- [ ]`) so they should not echo back as user attrs.
const IMPLICIT_ATTRS: Record<string, { drop?: string[]; classBlocklist?: string[] }> = {
  blockquote: { drop: ['as'] },
  ul: { classBlocklist: ['contains-task-list'] },
  li: { classBlocklist: ['task-list-item'] },
  // `language`/`filename`/`highlights`/`meta` ride on the fence info string.
  // `tabindex`/`style` come from render-time plugins (e.g. shiki) and have no
  // markdown form. `class` is handled specially in userBlockAttrs because shiki
  // merges its injected classes with the user's class — we need to strip just
  // the highlighter portion.
  pre: { drop: ['language', 'filename', 'highlights', 'meta', 'tabindex', 'style'] },
}

/**
 * Filter implicit/auto-generated attrs that are encoded by the native
 * markdown syntax and shouldn't echo back as `{attr=...}`. Used by the
 * block stringifiers to decide whether a node has *user* attrs that must
 * be preserved via the `::tag{...}` wrapper form.
 */
export function userBlockAttrs(tag: string, attributes: Record<string, unknown>): Record<string, unknown> {
  const rule = IMPLICIT_ATTRS[tag]
  if (!rule) return { ...attributes }

  const result: Record<string, unknown> = {}
  for (const [key, value] of Object.entries(attributes)) {
    if (rule.drop?.includes(key)) continue
    if (key === 'class' && rule.classBlocklist && typeof value === 'string') {
      const remaining = value
        .split(/\s+/)
        .filter((c) => c && !rule.classBlocklist!.includes(c))
        .join(' ')
      if (remaining) result[key] = remaining
      continue
    }
    if (key === 'class' && tag === 'pre' && typeof value === 'string' && value.startsWith('shiki ')) {
      // Shiki injects `shiki [shiki-themes] <themes…> dark:<theme>` and any
      // user-supplied class is appended after it. Recover the user portion by
      // dropping everything up to and including the first `dark:*` token.
      const tokens = value.split(/\s+/)
      let cutoff = tokens.findIndex((t) => t === '.')

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
        return (value as string)
          .split(' ')
          .map((c) => `.${c}`)
          .join('')
      }

      if (typeof value === 'object') {
        return `${key}="${JSON.stringify(value).replace(/"/g, '\\"')}"`
      }

      return `${key}="${value}"`
    })
    .join(' ')

  return attrs.length > 0 ? `{${attrs}}` : ''
}

/**
 * Convert attributes to a string of HTML attributes
 *
 * @param attributes - The attributes to stringify
 * @returns The stringified attributes
 */
export function htmlAttributes(attributes: Record<string, unknown>) {
  const parts: string[] = []
  for (const [key, value] of Object.entries(attributes)) {
    if (key.startsWith(':')) {
      if (value === 'true') {
        parts.push(key.slice(1))
        continue
      }
      if (typeof value === 'object' && value !== null) {
        parts.push(`${key.slice(1)}="${JSON.stringify(value).replace(/"/g, '\\"')}"`)
        continue
      }
      parts.push(`${key.slice(1)}="${value}"`)
      continue
    }

    if (value === true || value === 'true') {
      parts.push(key)
      continue
    }
    if (value === false || value === null || value === undefined) continue

    if (typeof value === 'object') {
      parts.push(`${key}="${JSON.stringify(value).replace(/"/g, '\\"')}"`)
      continue
    }

    parts.push(`${key}="${value}"`)
  }
  return parts.join(' ')
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
  // Normalize boolean attributes to remove the colon prefix
  const normalized = Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => {
      if (key.startsWith(':') && (value === 'true' || value === 'false')) {
        return [key.slice(1), value]
      }
      return [key, value]
    })
  )

  const yamlContent = stringifyYaml(normalized).trim()

  if (style === 'frontmatter') {
    return `---\n${yamlContent}\n---`
  }

  const fence = yamlContent.includes('```') ? '~~~' : '```'
  return `${fence}yaml [props]\n${yamlContent}\n${fence}`
}

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
  options: ResolveAttributesOptions = {},
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
        }
        catch {
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
export function resolveAttribute(
  attrs: Record<string, unknown>,
  renderData: NodeRenderData,
  key: string,
): unknown {
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
        return (value as string).split(' ').map(c => `.${c}`).join('')
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
export function comarkYamlAttributes(attributes: Record<string, unknown>, style: 'frontmatter' | 'codeblock' = 'codeblock') {
  // Normalize boolean attributes to remove the colon prefix
  const normalized = Object.fromEntries(
    Object.entries(attributes).map(([key, value]) => {
      if (key.startsWith(':') && (value === 'true' || value === 'false')) {
        return [key.slice(1), value]
      }
      return [key, value]
    }),
  )

  const yamlContent = stringifyYaml(normalized).trim()

  if (style === 'frontmatter') {
    return `---\n${yamlContent}\n---`
  }

  const fence = yamlContent.includes('```') ? '~~~' : '```'
  return `${fence}yaml [props]\n${yamlContent}\n${fence}`
}

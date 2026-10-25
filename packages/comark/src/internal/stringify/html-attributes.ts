import { escapeHtml, get } from '../../utils/index.ts'
import { isUnsafeUrlValue, isUrlPropKey } from '../sanitize.ts'
import type { NodeRenderData } from '../../types.ts'

export interface ResolveAttributesOptions {
  /**
   * When true, every `:prefixed` string value is JSON-parsed first and the
   * `:` prefix is always stripped. Non-JSON strings fall back to a dot-path
   * lookup in `renderData`; unresolved paths yield `undefined`.
   *
   * This matches the Vue/React/Svelte/Angular renderer semantics, which always
   * normalize bindings into real JS values suitable for typed component props.
   *
   * When false (default) only dot-path lookups are applied — literals and
   * unresolved paths are preserved verbatim so string-based serializers
   * (like HTML attribute emitters) can apply their own `:prefix` handling.
   */
  parseJson?: boolean
}

// DOM sinks that turn a string/object prop into raw markup (`innerHTML`,
// `dangerouslySetInnerHTML`) or overwrite an element's children
// (`textContent`). Framework renderers hand resolved attributes to
// `h()`/`createElement`/spreads verbatim, so these keys are never forwarded
// from document attributes — raw HTML has its own explicit path.
const HTML_SINK_PROPS = new Set(['innerhtml', 'dangerouslysetinnerhtml', 'textcontent'])

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
    const outKey = isBinding ? key.slice(1) : key
    // Vue's `.prop` / `^attr` prefixes still write the named DOM property
    const lowerOutKey = outKey.replace(/^[.^]/, '').toLowerCase()

    if (HTML_SINK_PROPS.has(lowerOutKey)) continue

    let outValue: unknown
    let resultKey = key

    if (options.parseJson && isBinding) {
      // Framework mode: always strip `:` and hand components real JS values.
      if (typeof value === 'string') {
        try {
          outValue = JSON.parse(value)
        } catch {
          // not JSON — fall through to dot-path lookup
          outValue = get(renderData, value)
        }
      } else {
        // Non-string binding value (e.g. an object literal the parser already
        // decoded) — pass through with the prefix stripped.
        outValue = value
      }
      resultKey = outKey
    } else if (isBinding && typeof value === 'string') {
      const resolved = get(renderData, value)
      if (resolved !== undefined) {
        outValue = resolved
        resultKey = outKey
      } else {
        outValue = value
      }
    } else {
      outValue = value
    }

    // Hard floor: a binding must never resolve a URL prop to an unsafe scheme
    // (javascript:, data:text/html, …). Parse-time validation only sees the
    // literal path, so the resolved value is checked here — even when the
    // security plugin is not enabled.
    // The URL props are the ones `validateProp()` checks: `:link="frontmatter.x"` counts too.
    if (isBinding && isUrlPropKey(outKey) && typeof outValue === 'string' && isUnsafeUrlValue(outValue)) {
      continue
    }

    result[resultKey] = outValue
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

// HTML attribute names must start with a letter/underscore/colon and may only
// contain alphanumerics plus `_ : . -`. Anything else (quotes, spaces, …)
// could break out of the attribute list, so such keys are dropped entirely.
const SAFE_ATTR_NAME = /^[a-zA-Z_:][a-zA-Z0-9_:.-]*$/

/**
 * Convert attributes to a string of HTML attributes
 *
 * @param attributes - The attributes to stringify
 * @returns The stringified attributes
 */
export function htmlAttributes(attributes: Record<string, unknown>) {
  const parts: string[] = []
  for (const [rawKey, value] of Object.entries(attributes)) {
    const key = rawKey.startsWith(':') ? rawKey.slice(1) : rawKey
    if (!SAFE_ATTR_NAME.test(key)) continue

    if (rawKey.startsWith(':')) {
      if (value === 'true') {
        parts.push(key)
        continue
      }
      if (typeof value === 'object' && value !== null) {
        parts.push(`${key}="${escapeHtml(JSON.stringify(value))}"`)
        continue
      }
      parts.push(`${key}="${escapeHtml(String(value))}"`)
      continue
    }

    if (value === true || value === 'true') {
      parts.push(key)
      continue
    }
    if (value === false || value === null || value === undefined) continue

    if (typeof value === 'object') {
      parts.push(`${key}="${escapeHtml(JSON.stringify(value))}"`)
      continue
    }

    parts.push(`${key}="${escapeHtml(String(value))}"`)
  }
  return parts.join(' ')
}

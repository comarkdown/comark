import { get } from '../../utils/index.ts'
import { REJECTED_PROP, validateProp } from '../props-validation.ts'
import type { NodeRenderData } from '../../types.ts'

/** Returned when the prop must be omitted because no value is available. */
export const UNRESOLVED = Symbol('comark:unresolved-template')

const MAX_LENGTH = 4096
/** The render context namespaces. Other roots stay as written. */
const ROOTS = new Set(['frontmatter', 'meta', 'data', 'props'])
/** Names that would reach the prototype chain. */
const BLOCKED_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype'])
/** Props that are not plain text, or that choose the rendered element. */
const RESERVED_NAMES = new Set(['key', 'ref', 'is', 'as', 'style'])
const BAD_PATH_CHARS = /[\s{}[\]|'"]/
/** Control and bidi override characters that must never reach a prop. */
// oxlint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F\u202A-\u202E\u2066-\u2069]/g

/** One `{{ path || fallback }}` placeholder. */
interface Placeholder {
  path: string
  fallback?: string
}

/** Returns `undefined` when malformed, so the whole value stays as written. */
function parsePlaceholder(inner: string): Placeholder | undefined {
  const split = inner.indexOf('||')
  const path = (split < 0 ? inner : inner.slice(0, split)).trim()
  const segments = path.split('.')
  if (!ROOTS.has(segments[0]!) || BAD_PATH_CHARS.test(path)) return undefined
  if (segments.some((s) => s === '' || BLOCKED_SEGMENTS.has(s))) return undefined
  return split < 0 ? { path } : { path, fallback: inner.slice(split + 2).trim() }
}

/** Alternates text and placeholders, so the result always starts and ends with text. */
function parseTemplate(value: string): Array<string | Placeholder> | undefined {
  const parts: Array<string | Placeholder> = []
  let pos = 0
  for (let open = value.indexOf('{{'); open >= 0; open = value.indexOf('{{', pos)) {
    const close = value.indexOf('}}', open + 2)
    const placeholder = close < 0 ? undefined : parsePlaceholder(value.slice(open + 2, close))
    if (!placeholder) return undefined
    parts.push(value.slice(pos, open), placeholder)
    pos = close + 2
  }
  parts.push(value.slice(pos))
  return parts
}

/** Only text, numbers and booleans count. A throwing getter counts as missing. */
function lookup(renderData: NodeRenderData, path: string): string | undefined {
  try {
    const found = get(renderData, path)
    const ok = typeof found === 'string' || typeof found === 'boolean' || Number.isFinite(found)
    return ok ? String(found) : undefined
  } catch {
    return undefined
  }
}

/**
 * Resolve `{{ path || default }}` placeholders in the value of a `:prop`.
 * Returns `undefined` when the value is not a template, so the caller keeps its usual behavior.
 * Returns `UNRESOLVED` when the prop must be omitted, and `REJECTED_PROP` when the result is unsafe.
 * Inserted text is never scanned again, so data cannot inject placeholders.
 */
export function interpolateProp(
  name: string,
  value: string,
  renderData: NodeRenderData
): string | typeof UNRESOLVED | typeof REJECTED_PROP | undefined {
  // A key such as `::title` is a nested binding, so leave it alone
  if (value.length > MAX_LENGTH || !value.includes('{{') || name.startsWith(':')) return undefined
  if (RESERVED_NAMES.has(name.toLowerCase().replace(/^[.^]/, ''))) return undefined
  // A JSON string literal is the escape hatch that keeps the plain binding behavior
  if (value[0] === '"') {
    try {
      JSON.parse(value)
      return undefined
    } catch {
      // Not a JSON string: continue as a template
    }
  }
  const parts = parseTemplate(value)
  if (!parts) return undefined

  const sole = parts.length === 3 && parts[0] === '' && parts[2] === ''
  let output = ''
  for (const part of parts) {
    if (typeof part === 'string') {
      output += part
    } else {
      const found = lookup(renderData, part.path) ?? part.fallback
      // A sole placeholder has no text around it, so omitting the prop is safer than an empty value
      if (found === undefined && sole) return UNRESOLVED
      // Skip cleaning a huge value, because it can only exceed the limit
      if (found !== undefined && found.length > MAX_LENGTH) return UNRESOLVED
      // Line breaks become a space, other control characters are removed
      output += (found ?? '').replace(/[\t\r\n]+/g, ' ').replace(CONTROL_CHARS, '')
    }
    if (output.length > MAX_LENGTH) return UNRESOLVED
  }

  // Check the final text, so a scheme split across pieces is caught
  return validateProp(name, output) === REJECTED_PROP ? REJECTED_PROP : output
}

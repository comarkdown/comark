/** Longest `:prop` value scanned for placeholders, and longest interpolated result. */
export const MAX_TEMPLATE_LENGTH = 4096

/** The render context namespaces. Other roots stay as written. */
const ROOTS = new Set(['frontmatter', 'meta', 'data', 'props'])
/** Names that would reach the prototype chain. */
const BLOCKED_SEGMENTS = new Set(['__proto__', 'constructor', 'prototype'])
const BAD_PATH_CHARS = /[\s{}[\]|'"]/

/** One `{{ path || fallback }}` placeholder. */
export interface Placeholder {
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

/**
 * Split a `:prop` value into text and `{{ path || default }}` placeholders.
 * The result alternates text and placeholders, so it always starts and ends with text.
 * Returns `undefined` when the value has no placeholder or any placeholder is malformed.
 */
export function parseTemplate(value: string): Array<string | Placeholder> | undefined {
  if (value.length > MAX_TEMPLATE_LENGTH || !value.includes('{{')) return undefined
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

/** Whether a value is a well-formed template, i.e. `binding()` interpolates it. */
export function hasTemplate(value: string): boolean {
  return parseTemplate(value) !== undefined
}

import { get } from '../../utils/index.ts'
import { REJECTED_PROP, fixesHost, isUrlProp, normalizePropName, validateProp } from '../props-validation.ts'
import { MAX_TEMPLATE_LENGTH, parseTemplate } from '../template.ts'
import type { NodeRenderData } from '../../types.ts'

/** Returned when the prop must be omitted because no value is available. */
export const UNRESOLVED = Symbol('comark:unresolved-template')

/** Props that are not plain text, or that choose the rendered element. */
const RESERVED_NAMES = new Set(['key', 'ref', 'is', 'as', 'style'])
/** Control and bidi override characters that must never reach a prop. */
// oxlint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F‪-‮⁦-⁩]/g
/** A URL that browsers resolve against another host (`//host`, `/\host`), after the leading whitespace they strip. */
// oxlint-disable-next-line no-control-regex
const SCHEME_RELATIVE = /^[\u0000- ]*[/\\]{2}/

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
 * Only called for nodes marked by the `binding()` plugin.
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
  if (name.startsWith(':') || RESERVED_NAMES.has(name.toLowerCase().replace(/^[.^]/, ''))) return undefined
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
      if (found !== undefined && found.length > MAX_TEMPLATE_LENGTH) return UNRESOLVED
      // Line breaks become a space, other control characters are removed
      output += (found ?? '').replace(/[\t\r\n]+/g, ' ').replace(CONTROL_CHARS, '')
    }
    if (output.length > MAX_TEMPLATE_LENGTH) return UNRESOLVED
  }

  // Literal text must not join with data into a link to another host: `/{{ x }}` or `///{{ x }}`
  // with `x = "evil.com"`. A value that starts with data is as trusted as a plain `:href="data.url"` binding.
  const prefix = parts[0] as string
  if (prefix !== '' && SCHEME_RELATIVE.test(output) && !fixesHost(prefix) && isUrlProp(normalizePropName(name))) {
    return REJECTED_PROP
  }

  // Check the final text, so a scheme split across pieces is caught
  return validateProp(name, output) === REJECTED_PROP ? REJECTED_PROP : output
}

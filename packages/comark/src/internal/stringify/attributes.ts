import { stringifyYaml } from '../yaml.ts'
import { escapeHtml, get } from '../../utils/index.ts'
import { isUnsafeUrlValue } from '../props-validation.ts'
import { pickFence } from './fence.ts'
import type { NodeRenderData } from '../../types.ts'
import type { ComarkModel } from '../../model.ts'

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
  /**
   * When provided, `::prop="path"` attributes are resolved as two-way
   * bindings: the current value is read from `model.get(path)` and an
   * `onUpdate:prop` handler is emitted that writes back via `model.set`.
   *
   * Without a model, `::prop` degrades silently to a one-way read from
   * `renderData` (same as `:prop`).
   */
  model?: ComarkModel
}

// DOM sinks that turn a string/object prop into raw markup (`innerHTML`,
// `dangerouslySetInnerHTML`) or overwrite an element's children
// (`textContent`). Framework renderers hand resolved attributes to
// `h()`/`createElement`/spreads verbatim, so these keys are never forwarded
// from document attributes — raw HTML has its own explicit path.
const HTML_SINK_PROPS = new Set(['innerhtml', 'dangerouslysetinnerhtml', 'textcontent'])

/** Prefer `model.get(path)` when a model is present, then fall back to `renderData`. */
const lookupPath = (path: string, renderData: NodeRenderData, model?: ComarkModel): unknown => {
  if (model) {
    const fromModel = model.get(path)
    if (fromModel !== undefined) return fromModel
  }
  return get(renderData, path)
}

/**
 * Resolve `:prefixed` and `::prefixed` attributes against the render context.
 *
 * **One-way (`:`)**
 * Default behavior: a `:prefixed` string value that matches a dot-path in
 * `{ frontmatter, meta, data, props }` is replaced with the resolved value
 * (and the `:` prefix is stripped). Anything that doesn't resolve — literals
 * like `"5"` / `"true"`, unknown paths, or already-parsed object values — is
 * left untouched and keeps its `:` prefix.
 *
 * With `parseJson: true`, every `:prefixed` string is JSON-parsed first and
 * the `:` prefix is always stripped, falling back to the dot-path lookup.
 * The `$` metadata key is never forwarded.
 *
 * **Two-way (`::`, `options.model`)**
 * When a `::prop="path"` key is present:
 * - In framework mode (`parseJson: true`) with a `model`: emits `prop` (read
 *   via `model.get`) and `onUpdate:prop` (write handler). Degrades to one-way
 *   when no model is supplied.
 * - In preserve/HTML mode: emits `prop` (resolved from `renderData`) plus
 *   `data-comark-model-{prop}="path"` for the HTML progressive-enhancement
 *   runtime.
 * - A filtered expression (`::prop="path | filter"`) is not assignable: in
 *   dev it throws; in production it degrades to one-way silently.
 */
export function resolveAttributes(
  attrs: Record<string, unknown>,
  renderData: NodeRenderData,
  options: ResolveAttributesOptions = {}
): Record<string, unknown> {
  const result: Record<string, unknown> = {}
  const { model } = options

  for (const key in attrs) {
    if (key === '$') continue

    const value = attrs[key]
    const isDoubleBinding = key.charCodeAt(0) === 58 /* ':' */ && key.charCodeAt(1) === 58 /* ':' */
    const isBinding = !isDoubleBinding && key.charCodeAt(0) === 58 /* ':' */
    const outKey = isDoubleBinding ? key.slice(2) : isBinding ? key.slice(1) : key

    if (HTML_SINK_PROPS.has(outKey.toLowerCase())) continue

    // --- Two-way binding (::prop="path") ---
    if (isDoubleBinding) {
      const path = typeof value === 'string' ? value.trim() : ''
      if (!path) continue

      const lowerOutKey = outKey.toLowerCase()

      // Filtered expressions are projections and are not assignable.
      if (path.includes('|')) {
        if ((import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV) {
          throw new Error(
            `[comark] ::${outKey}="${path}" contains a pipe filter. Filtered expressions are not writable. Use a plain path for two-way binding.`
          )
        }
        // Production: degrade to one-way
        const plainPath = path.split('|')[0].trim()
        const readValue = lookupPath(plainPath, renderData, model)
        if (readValue !== undefined) {
          if (
            (lowerOutKey === 'href' || lowerOutKey === 'src' || lowerOutKey === 'xlink:href') &&
            typeof readValue === 'string' &&
            isUnsafeUrlValue(readValue)
          )
            continue
          result[outKey] = readValue
        }
        continue
      }

      if (options.parseJson) {
        // Framework mode: emit value + update handler.
        const readValue = lookupPath(path, renderData, model)
        if (
          (lowerOutKey === 'href' || lowerOutKey === 'src' || lowerOutKey === 'xlink:href') &&
          typeof readValue === 'string' &&
          isUnsafeUrlValue(readValue)
        )
          continue
        result[outKey] = readValue
        if (model) {
          result[`onUpdate:${outKey}`] = (next: unknown) => model.set(path, next)
        }
      } else {
        // Preserve / HTML-string mode: emit the read value + model-path marker.
        const readValue = lookupPath(path, renderData, model)
        if (
          (lowerOutKey === 'href' || lowerOutKey === 'src' || lowerOutKey === 'xlink:href') &&
          typeof readValue === 'string' &&
          isUnsafeUrlValue(readValue)
        )
          continue
        if (readValue !== undefined) result[outKey] = readValue
        // The HTML runtime reads this attribute to discover which model path
        // controls this element's property.
        result[`data-comark-model-${outKey}`] = path
      }
      continue
    }

    // --- One-way binding (:prop="...") and plain attributes ---
    let outValue: unknown
    let resultKey = key

    if (options.parseJson && isBinding) {
      // Framework mode: always strip `:` and hand components real JS values.
      if (typeof value === 'string') {
        try {
          outValue = JSON.parse(value)
        } catch {
          // not JSON — fall through to dot-path lookup
          outValue = lookupPath(value, renderData, model)
        }
      } else {
        // Non-string binding value (e.g. an object literal the parser already
        // decoded) — pass through with the prefix stripped.
        outValue = value
      }
      resultKey = outKey
    } else if (isBinding && typeof value === 'string') {
      const resolved = lookupPath(value, renderData, model)
      if (resolved !== undefined) {
        outValue = resolved
        resultKey = outKey
      } else {
        outValue = value
      }
    } else {
      outValue = value
    }

    // Hard floor: a binding must never resolve href/src to an unsafe scheme
    // (javascript:, data:text/html, …). Parse-time validation only sees the
    // literal path, so the resolved value is checked here — even when the
    // security plugin is not enabled.
    const lowerOutKey = outKey.toLowerCase()
    if (
      isBinding &&
      (lowerOutKey === 'href' || lowerOutKey === 'src' || lowerOutKey === 'xlink:href') &&
      typeof outValue === 'string' &&
      isUnsafeUrlValue(outValue)
    ) {
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
  // to strip just the highlighter portion.
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
    if (
      key === 'class' &&
      tag === 'pre' &&
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
      // Single-colon boolean shorthand: `:disabled` → `disabled`.
      // Guard against double-colon so `::value="true"` stays as `::value="true"`.
      if (key.startsWith(':') && !key.startsWith('::') && value === 'true') {
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
    // Two-way binding keys (::X) that reach htmlAttributes come from raw AST
    // nodes (non-framework stringify). Emit model-path data-attributes so the
    // HTML runtime can discover them; omit the native attr since the value
    // should come from the resolved attrs that resolveAttributes already added.
    if (rawKey.startsWith('::')) {
      const propName = rawKey.slice(2)
      if (propName && typeof value === 'string') {
        parts.push(`data-comark-model-${propName}="${escapeHtml(value)}"`)
      }
      continue
    }

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
      // Two-way binding keys keep their `::` prefix — they are path bindings
      // and must round-trip exactly as `::prop="path"`.
      if (key.startsWith('::')) {
        return [key, value]
      }
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

// #region resolveModelElement

/**
 * Describes how a renderer should wire a two-way model binding for a native
 * form element. The table mirrors RFC §5.4.
 */
export interface ModelElementBinding {
  /** The element property that holds the model value (e.g. 'value', 'checked'). */
  prop: string
  /** The DOM event that signals a user write (e.g. 'input', 'change'). */
  event: string
  /** Coerce the event-target value to the correct JavaScript type. */
  coerce: (target: { value: string; checked: boolean; files: FileList | null }) => unknown
  /**
   * Map the stored model value to the DOM property. Used when the stored value
   * is not the same as the element property (radio: model holds the group's
   * selected `value` string, but `checked` must be a boolean).
   */
  read?: (modelValue: unknown, attrs: Record<string, unknown>) => unknown
}

const TEXT_INPUT_TYPES = new Set(['text', 'search', 'email', 'password', 'url', 'tel', 'color'])
const NUMBER_INPUT_TYPES = new Set(['number', 'range'])
const DATE_INPUT_TYPES = new Set(['date', 'time', 'datetime-local', 'month', 'week'])

/**
 * Return the model-element binding descriptor for a native HTML element that
 * participates in two-way binding, or `null` for non-form elements.
 *
 * Renderers use this to wire the correct DOM event listener and value coercion
 * without duplicating the mapping table in every framework adapter.
 */
export const resolveModelElement = (
  tag: string,
  modelProp: string,
  attrs: Record<string, unknown>
): ModelElementBinding | null => {
  if (tag === 'input') {
    const type = String(attrs.type ?? 'text').toLowerCase()
    if (modelProp === 'value' && TEXT_INPUT_TYPES.has(type)) {
      return { prop: 'value', event: 'input', coerce: (t) => t.value }
    }
    if (modelProp === 'value' && NUMBER_INPUT_TYPES.has(type)) {
      return { prop: 'value', event: 'input', coerce: (t) => Number(t.value) }
    }
    if (modelProp === 'value' && DATE_INPUT_TYPES.has(type)) {
      return { prop: 'value', event: 'change', coerce: (t) => t.value }
    }
    if (modelProp === 'checked' && type === 'checkbox') {
      return { prop: 'checked', event: 'change', coerce: (t) => t.checked }
    }
    if (modelProp === 'checked' && type === 'radio') {
      return {
        prop: 'checked',
        event: 'change',
        coerce: (t) => t.value,
        read: (modelValue, attrs) => modelValue === attrs.value,
      }
    }
    if (modelProp === 'files' && type === 'file') {
      return { prop: 'files', event: 'change', coerce: (t) => t.files }
    }
    return null
  }
  if ((tag === 'select' || tag === 'textarea') && modelProp === 'value') {
    return {
      prop: 'value',
      event: tag === 'select' ? 'change' : 'input',
      coerce: (t) => t.value,
    }
  }
  return null
}

/**
 * DOM property value for a native model binding. Radio compares against the
 * element's `value` attribute; other controls use the stored value (with an
 * empty-string fallback so React/Vue keep the input controlled).
 */
export const modelElementDisplayValue = (
  binding: ModelElementBinding,
  modelValue: unknown,
  attrs: Record<string, unknown>
): unknown => {
  if (binding.read) return binding.read(modelValue, attrs)
  if (binding.prop === 'checked') return Boolean(modelValue)
  if (binding.prop === 'files') return modelValue ?? null
  return modelValue ?? ''
}

// #endregion

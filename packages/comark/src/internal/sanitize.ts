/**
 * Sentinel returned by {@link validateProp} to signal "drop this attribute".
 * A dedicated symbol (rather than `false`) keeps rejection distinguishable
 * from a prop whose real value is the boolean `false` (#367).
 */
export const REJECTED_PROP = Symbol('comark:rejected-prop')

export const unsafeTags = ['object']

// `innerHTML` / `dangerouslySetInnerHTML` / `textContent` are DOM sinks that
// turn a string prop into raw markup or overwrite an element's children.
// Framework renderers receive resolved props verbatim, so markdown-authored
// values would otherwise bypass tag filtering (raw HTML has its own explicit
// path via the `html` plugin and does not need these).
export const unsafeAttributes = ['srcdoc', 'formaction', 'innerhtml', 'dangerouslysetinnerhtml', 'textcontent']

export const unsafeProtocols = ['javascript:', 'vbscript:']

/**
 * Whether `url` is a known-unsafe protocol.
 */
function isUnsafeProtocol(url: URL, allowDataImage: boolean): boolean {
  if (unsafeProtocols.includes(url.protocol)) return true
  if (url.protocol !== 'data:') return false
  if (!allowDataImage) return true

  const body = url.href.slice('data:'.length)
  let end = 0
  while (end < body.length && body[end] !== ',' && body[end] !== ';') end++
  return !body.slice(0, end).trim().toLowerCase().startsWith('image/')
}

export interface PropsValidationOptions {
  allowedLinkPrefixes?: string[]
  allowedImagePrefixes?: string[]
  allowedProtocols?: string[]
  defaultOrigin?: string
  allowDataImages?: boolean
}

function rewriteToDefaultOrigin(urlStr: string, defaultOrigin: string): string {
  try {
    const parsed = new URL(urlStr)
    const origin = new URL(defaultOrigin)
    parsed.protocol = origin.protocol
    parsed.host = origin.host
    return parsed.href
  } catch {
    return defaultOrigin
  }
}

// Named entities relevant to URL smuggling — the full HTML5 table is huge,
// but these are the ones that can hide a scheme or whitespace inside it.
const NAMED_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  colon: ':',
  sol: '/',
  bsol: '\\',
  Tab: '\t',
  NewLine: '\n',
}

/**
 * Decode HTML entities until stable. Browsers entity-decode attribute values
 * before navigating, so validation must inspect the decoded form — stripping
 * entities instead (the previous behavior) let `javascript&#58;alert(1)`
 * through as a "relative" URL. Repeating the pass catches nested encodings
 * like `&amp;#58;`.
 */
function decodeHtmlEntities(value: string): string {
  let result = value
  for (let pass = 0; pass < 10; pass++) {
    const decoded = result
      .replace(/&#x([0-9a-f]+);?/gi, (match, hex) => {
        const code = Number.parseInt(hex, 16)
        return code <= 0x10ffff ? String.fromCodePoint(code) : match
      })
      .replace(/&#(\d+);?/g, (match, dec) => {
        const code = Number.parseInt(dec, 10)
        return code <= 0x10ffff ? String.fromCodePoint(code) : match
      })
      .replace(/&([a-z]+);?/gi, (match, name) => NAMED_ENTITIES[name] ?? match)
    if (decoded === result) break
    result = decoded
  }
  return result
}

function validateUrl(
  value: string,
  mode: 'link' | 'image',
  options: PropsValidationOptions
): string | typeof REJECTED_PROP {
  const {
    allowedLinkPrefixes = ['*'],
    allowedImagePrefixes = ['*'],
    allowedProtocols = ['*'],
    defaultOrigin,
    allowDataImages = true,
  } = options

  let decodedUrl: string
  try {
    decodedUrl = decodeURIComponent(value)
  } catch {
    // Malformed percent-encoding — inspect the raw value instead of throwing
    decodedUrl = value
  }
  const urlSanitized = decodeHtmlEntities(decodedUrl)

  // Dummy origin used to unmask scheme-relative (//host) and backslash
  // (\\host) URLs: resolved against it, those land on the attacker's origin,
  // while genuinely relative paths stay on the dummy origin.
  const DUMMY_BASE = 'http://comark.invalid'

  let url: URL
  try {
    // Parse without a base — throws for relative URLs, succeeds for absolute
    url = new URL(urlSanitized)
  } catch {
    let resolved: URL
    try {
      resolved = new URL(urlSanitized, DUMMY_BASE)
    } catch {
      // Unparseable even with a base — treat as relative
      return value
    }
    if (resolved.origin === DUMMY_BASE) {
      // Genuinely relative URLs are always allowed
      return value
    }
    // Scheme-relative/backslash form — check it as the absolute URL it
    // resolves to in the browser
    url = resolved
  }

  if (isUnsafeProtocol(url, mode === 'image' && allowDataImages)) {
    return REJECTED_PROP
  }

  // Check allowed protocols
  if (!allowedProtocols.includes('*')) {
    const protocol = url.protocol.replace(':', '')
    if (!allowedProtocols.includes(protocol)) {
      return REJECTED_PROP
    }
  }

  // Check allowed URL prefixes
  const allowedPrefixes = mode === 'link' ? allowedLinkPrefixes : allowedImagePrefixes
  if (!allowedPrefixes.includes('*')) {
    const matchesPrefix = allowedPrefixes.some((prefix) => matchesAllowedPrefix(url, prefix))
    if (!matchesPrefix) {
      if (defaultOrigin) {
        return rewriteToDefaultOrigin(urlSanitized, defaultOrigin)
      }
      return REJECTED_PROP
    }
  }

  return value
}

/**
 * Whether `url` matches an allowed prefix. Absolute-URL prefixes compare by
 * parsed origin plus a path-segment boundary, so a lookalike host such as
 * `https://myapp.com.evil.com` never matches the prefix `https://myapp.com`.
 * Non-URL prefixes (unusual) fall back to a raw string prefix match.
 */
function matchesAllowedPrefix(url: URL, prefix: string): boolean {
  const normalized = prefix.toLowerCase()
  if (!normalized.includes('://')) {
    return url.href.toLowerCase().startsWith(normalized)
  }
  let prefixUrl: URL
  try {
    prefixUrl = new URL(normalized)
  } catch {
    return url.href.toLowerCase().startsWith(normalized)
  }
  if (url.origin.toLowerCase() !== prefixUrl.origin.toLowerCase()) return false
  const prefixPath = prefixUrl.pathname
  if (prefixPath === '/') return true
  const path = url.pathname.toLowerCase()
  return path === prefixPath || path.startsWith(prefixPath.endsWith('/') ? prefixPath : `${prefixPath}/`)
}

/**
 * Whether `value` is a known-unsafe URL.
 */
export function isUnsafeUrlValue(value: string): boolean {
  if (!value.includes(':') && !value.includes('&') && !value.includes('%')) return false

  let decoded = value
  try {
    decoded = decodeURIComponent(value)
  } catch {
    // Malformed percent-encoding — inspect the raw value
  }
  const sanitized = decodeHtmlEntities(decoded)

  let url: URL
  try {
    url = new URL(sanitized)
  } catch {
    return false
  }
  // No prop mode here: a data image passes, as it cannot run script.
  return isUnsafeProtocol(url, true)
}

// Attributes browsers navigate to or load as a URL, beyond the `*href` /
// `*src` / `*url` / `*link` names matched by URL_PROP_SUFFIX. `to` is the
// Vue Router / NuxtLink destination, which ends up as an `<a href>`.
const URL_PROPS = new Set(['to', 'action', 'poster', 'cite', 'background', 'ping'])
const URL_PROP_SUFFIX = /(?:href|src|url|uri|link)s?$/

/**
 * Whether a normalized prop name carries a URL. Matching by name (rather than
 * checking every string value) keeps prose such as
 * `title="JavaScript: the good parts"` intact: it parses as a `javascript:`
 * URL, but is never navigated to.
 */
function isUrlProp(name: string): boolean {
  return URL_PROPS.has(name) || URL_PROP_SUFFIX.test(name)
}

/**
 * Lowercase and strip everything that does not change which DOM property a
 * renderer writes: binding prefixes (`:`, `v-bind:`), Vue's force-prop/attr
 * prefixes (`.innerHTML`, `^onclick`), and `:` / `-` / `_` separators
 * (`xlink:href`, `label-html`). `@x` / `v-on:x` become `onx`.
 */
function normalizePropName(attribute: string): string {
  return attribute
    .toLowerCase()
    .replace(/^(?:v-bind:|[:.^])+/, '')
    .replace(/^(?:@|v-on:)/, 'on')
    .replace(/[:_-]/g, '')
}

/** Whether a normalized prop name is an event handler or a markup sink, whatever its value. */
function isUnsafePropName(name: string): boolean {
  // `*Html` / `*-html` props (`innerHTML`, Nuxt UI's `labelHtml`, `v-html`)
  // are markup sinks: components render them with `v-html` or equivalents.
  return name.startsWith('on') || name.endsWith('html') || unsafeAttributes.includes(name)
}

/** Props that pick the element or component a renderer creates. */
const tagSelectors = ['as', 'is']

/** Whether prop `key` is a tag selector: `as`, `is`, or one of their bindings. */
export function isTagSelector(key: string): boolean {
  return tagSelectors.includes(normalizePropName(key))
}

/** A filter for tag selectors: `unsafeTags` and `blockedTags`, or any tag outside `allowedTags` when set. */
export function createTagFilter(blockedTags: string[] = [], allowedTags: string[] = []): (tag: string) => boolean {
  const blocked = new Set([...blockedTags, ...unsafeTags].map((tag) => tag.toLowerCase()))
  const allowed = new Set(allowedTags.map((tag) => tag.toLowerCase()))
  return (tag) => {
    const name = tag.toLowerCase()
    return blocked.has(name) || (allowed.size > 0 && !allowed.has(name))
  }
}

/**
 * Whether tag selector `key` can make a renderer create a tag `isFilteredTag` rejects.
 */
export function isUnsafeTagSelector(key: string, value: unknown, isFilteredTag: (tag: string) => boolean): boolean {
  if (typeof value !== 'string') return false
  if (!/^(?::|v-bind:)/.test(key)) return isFilteredTag(value)

  let decoded: unknown
  try {
    decoded = JSON.parse(value)
  } catch {
    return true
  }
  return typeof decoded === 'string' && isFilteredTag(decoded)
}

export function validateProp(attribute: string, value: unknown, options: PropsValidationOptions = {}): unknown {
  const name = normalizePropName(attribute)
  if (isUnsafePropName(name)) {
    return REJECTED_PROP
  }

  // Renderers JSON-decode `:binding` strings before use, so validate the
  // decoded form — otherwise ':href' with '"javascript:..."' (a JSON-quoted
  // string) fails URL parsing and slips through as a "relative" URL, and a
  // JSON array/object would skip the nested checks.
  if (/^(?::|v-bind:)/.test(attribute) && typeof value === 'string') {
    let decoded: unknown = value
    try {
      decoded = JSON.parse(value)
    } catch {
      // Not JSON — a dot-path binding or literal, validated as-is
    }
    if (typeof decoded === 'object' && decoded !== null) {
      const result = validateValue(name, decoded, options)
      return result === REJECTED_PROP ? REJECTED_PROP : JSON.stringify(result)
    }
    const result = validateValue(name, typeof decoded === 'string' ? decoded : value, options)
    // Keep the original value so bindings still resolve at render time. The
    // defaultOrigin rewrite only makes sense for literal URLs.
    return result === REJECTED_PROP ? REJECTED_PROP : value
  }

  return validateValue(name, value, options)
}

function validateString(name: string, value: string, options: PropsValidationOptions): string | typeof REJECTED_PROP {
  // SVG `<animate>` / `<set>` targeting `href` can rewrite a link to the
  // script URL in `values` / `from` / `to` / `by` once the animation runs.
  if (name === 'attributename') {
    return decodeHtmlEntities(value).toLowerCase().includes('href') ? REJECTED_PROP : value
  }
  if (!isUrlProp(name)) return value
  return validateUrl(value, name.endsWith('src') || name === 'poster' ? 'image' : 'link', options)
}

function validateValue(name: string, value: unknown, options: PropsValidationOptions): unknown {
  if (typeof value === 'string') return validateString(name, value, options)

  // A non-string href/src can reach here as an array/object from the YAML
  // block-props JSON round-trip, and is stringified when set as an attribute.
  // Reject it instead of passing it through unvalidated (#367). Other URL
  // props (`to`, `link`, …) accept route/link objects, validated below.
  if (name === 'href' || name === 'xlinkhref' || name === 'src') return REJECTED_PROP

  // Array items inherit the prop name: `:hrefs='["javascript:…"]'`.
  if (Array.isArray(value)) {
    const result: unknown[] = []
    for (const item of value) {
      const validated = validateValue(name, item, options)
      if (validated !== REJECTED_PROP) result.push(validated)
    }
    return result
  }

  // Object keys are validated like top-level props, at any depth:
  // `:links='[{"to":"javascript:…","labelHtml":"<img onerror>"}]'`.
  if (typeof value === 'object' && value !== null) {
    const entries: Array<[string, unknown]> = []
    for (const [key, item] of Object.entries(value)) {
      const validated = validateProp(key, item, options)
      if (validated !== REJECTED_PROP) entries.push([key, validated])
    }
    // fromEntries defines a JSON `__proto__` key as an own property instead
    // of swapping the result's prototype
    return Object.fromEntries(entries)
  }

  return value
}

export function validateProps(
  type: string,
  props?: Record<string, any>,
  options: PropsValidationOptions = {}
): Record<string, any> {
  /**
   * If the tag is marked as unsafe, drop all props
   */
  if (unsafeTags.includes(type.toLowerCase())) {
    return {}
  }

  if (!props) return {}

  const entries = Object.entries(props)

  if (entries.length === 0) return {}

  props = Object.fromEntries(
    entries.flatMap(([name, value]) => {
      if (name === 'id' && !value) {
        return []
      }

      // Parser metadata (`$.html`, `$.line`), not a prop
      if (name === '$') {
        return [[name, value]]
      }

      const result = validateProp(name, value, options)

      if (result === REJECTED_PROP) {
        console.warn(`[comark/plugins/security] removing unsafe attribute: ${name}="${value}"`)
        return []
      }

      return [[name, result]]
    })
  )

  return props
}

export interface SanitizeDataOptions extends PropsValidationOptions {
  /** Tags an `as` or `is` value may not name. */
  blockedTags?: string[]
  /** When set, the only tags an `as` or `is` value may name. */
  allowedTags?: string[]
}

/**
 * Remove unsafe entries from `data`, such as frontmatter, in place, at any depth.
 */
export function sanitizeData(data: unknown, options: SanitizeDataOptions = {}): string[] {
  const isFilteredTag = createTagFilter(options.blockedTags, options.allowedTags)
  const removed: string[] = []

  const seen = new WeakMap<object, Set<string>>()

  // `key` is undefined for an array item: it inherits its array's name, as in `validateProp()`.
  const sanitizeEntry = (name: string, key: string | undefined, value: unknown): unknown => {
    if (key !== undefined) {
      if (isUnsafePropName(name)) return REJECTED_PROP
      if (tagSelectors.includes(name) && isUnsafeTagSelector(key, value, isFilteredTag)) return REJECTED_PROP
    }
    return typeof value === 'string' ? validateString(name, value, options) : value
  }

  const walk = (value: object, path: string, name: string): void => {
    const isArray = Array.isArray(value)
    const seenAs = isArray ? name : ''
    const names = seen.get(value)
    if (names?.has(seenAs)) return
    if (names) names.add(seenAs)
    else seen.set(value, new Set([seenAs]))

    let deleted = false
    for (const [key, child] of Object.entries(value)) {
      const at = path ? `${path}.${key}` : key
      const childName = isArray ? name : normalizePropName(key)
      const result = sanitizeEntry(childName, isArray ? undefined : key, child)
      if (result === REJECTED_PROP) {
        Reflect.deleteProperty(value, key)
        removed.push(at)
        deleted = true
      } else if (result !== child) {
        // `defaultOrigin` rewrote a URL.
        ;(value as Record<string, unknown>)[key] = result
      } else if (child !== null && typeof child === 'object') {
        walk(child, at, childName)
      }
    }

    if (deleted && isArray) {
      let length = 0
      for (let index = 0; index < value.length; index++) {
        if (index in value) value[length++] = value[index]
      }
      value.length = length
    }
  }
  if (data !== null && typeof data === 'object') walk(data, '', '')

  return removed
}

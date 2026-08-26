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

export const unsafeLinkPrefix = [
  'javascript:',
  'data:text/html',
  'vbscript:',
  'data:text/javascript',
  'data:text/vbscript',
  'data:text/css',
  'data:text/plain',
  'data:text/xml',
]

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

  // Block known-unsafe protocols — hard floor, not overrideable by options
  if (unsafeLinkPrefix.some((prefix) => url.href.toLowerCase().startsWith(prefix))) {
    return REJECTED_PROP
  }

  // Block data: images when allowDataImages is false
  if (mode === 'image' && !allowDataImages && url.protocol === 'data:') {
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
 * Hard-floor check: does this string resolve to a known-unsafe URL scheme
 * (`javascript:`, `data:text/html`, …)? Applied to binding-resolved values at
 * render time so dot-path data (frontmatter/meta/data) cannot smuggle an
 * unsafe URL past parse-time validation. Relative URLs are never unsafe here.
 */
export function isUnsafeUrlValue(value: string): boolean {
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
  return unsafeLinkPrefix.some((prefix) => url.href.toLowerCase().startsWith(prefix))
}

export function validateProp(attribute: string, value: unknown, options: PropsValidationOptions = {}): unknown {
  const isBinding = /^(:|v-bind:)/.test(attribute)
  attribute = attribute
    .toLowerCase()
    .replace(/^(:|v-bind:)/, '')
    .replace(/^(@|v-on:)/, 'on')
    .replace(/:/g, '')
  if (attribute.startsWith('on') || unsafeAttributes.includes(attribute)) {
    return REJECTED_PROP
  }

  if (attribute === 'href' || attribute === 'xlinkhref' || attribute === 'src') {
    // A non-string href/src can reach here as an array/object from the YAML
    // block-props JSON round-trip. Reject it instead of passing it through
    // unvalidated (#367).
    if (typeof value !== 'string') return REJECTED_PROP

    // Renderers JSON-decode `:binding` values before use, so validate the
    // decoded form — otherwise ':href' with '"javascript:..."' (a JSON-quoted
    // string) fails URL parsing and slips through as a "relative" URL.
    let effective = value
    if (isBinding) {
      try {
        const parsed: unknown = JSON.parse(value)
        if (typeof parsed === 'string') effective = parsed
      } catch {
        // Not JSON — a dot-path binding or literal, validated as-is
      }
    }

    const mode = attribute === 'src' ? 'image' : 'link'
    const result = validateUrl(effective, mode, options)
    if (result === REJECTED_PROP) return REJECTED_PROP
    // Keep the original value so bindings still resolve at render time. The
    // defaultOrigin rewrite only makes sense for literal URLs.
    return isBinding ? value : result
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

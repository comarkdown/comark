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

  let url: URL
  try {
    // Parse without a base — throws for relative URLs, succeeds for absolute
    url = new URL(urlSanitized)
  } catch {
    // Relative URLs are always allowed
    return value
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
    const href = url.href.toLowerCase()
    const matchesPrefix = allowedPrefixes.some((prefix) => href.startsWith(prefix.toLowerCase()))
    if (!matchesPrefix) {
      if (defaultOrigin) {
        return rewriteToDefaultOrigin(urlSanitized, defaultOrigin)
      }
      return REJECTED_PROP
    }
  }

  return value
}

export function validateProp(attribute: string, value: unknown, options: PropsValidationOptions = {}): unknown {
  attribute = attribute
    .toLowerCase()
    .replace(/^(:|v-bind:)/, '')
    .replace(/^(@|v-on:)/, 'on')
    .replace(/:/g, '')
  if (attribute.startsWith('on') || unsafeAttributes.includes(attribute)) {
    return REJECTED_PROP
  }

  if (attribute === 'href' || attribute === 'xlinkhref') {
    // A non-string href can reach here as an array/object from the YAML
    // block-props JSON round-trip. Reject it instead of passing it through
    // unvalidated (#367).
    return typeof value === 'string' ? validateUrl(value, 'link', options) : REJECTED_PROP
  }

  if (attribute === 'src') {
    return typeof value === 'string' ? validateUrl(value, 'image', options) : REJECTED_PROP
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

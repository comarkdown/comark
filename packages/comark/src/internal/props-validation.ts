export const unsafeTags = ['object']

export const unsafeAttributes = ['srcdoc', 'formaction']

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

function validateUrl(value: string, mode: 'link' | 'image', options: PropsValidationOptions): string | false {
  const {
    allowedLinkPrefixes = ['*'],
    allowedImagePrefixes = ['*'],
    allowedProtocols = ['*'],
    defaultOrigin,
    allowDataImages = true,
  } = options

  const decodedUrl = decodeURIComponent(value)
  const urlSanitized = decodedUrl
    .replace(/&#x([0-9a-f]+);?/gi, '')
    .replace(/&#(\d+);?/g, '')
    .replace(/&[a-z]+;?/gi, '')

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
    return false
  }

  // Block data: images when allowDataImages is false
  if (mode === 'image' && !allowDataImages && url.protocol === 'data:') {
    return false
  }

  // Check allowed protocols
  if (!allowedProtocols.includes('*')) {
    const protocol = url.protocol.replace(':', '')
    if (!allowedProtocols.includes(protocol)) {
      return false
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
      return false
    }
  }

  return value
}

export function validateProp(attribute: string, value: string, options: PropsValidationOptions = {}): string | false {
  attribute = attribute.toLowerCase()
  if (attribute.startsWith('on') || unsafeAttributes.includes(attribute)) {
    return false
  }

  if (attribute === 'href') {
    return validateUrl(value, 'link', options)
  }

  if (attribute === 'src') {
    return validateUrl(value, 'image', options)
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

      if (result === false) {
        console.warn(`[comark/plugins/security] removing unsafe attribute: ${name}="${value}"`)
        return []
      }

      return [[name, result]]
    })
  )

  return props
}

export const unsafeTags = [
  'object',
]

export const unsafeAttributes = [
  'srcdoc',
  'formaction',
]

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

function isAnchorLinkAllowed(value: string) {
  const decodedUrl = decodeURIComponent(value)
  const urlSanitized = decodedUrl.replace(/&#x([0-9a-f]+);?/gi, '')
    .replace(/&#(\d+);?/g, '')
    .replace(/&[a-z]+;?/gi, '')

  try {
    const url = new URL(urlSanitized, 'http://example.com')
    if (url.origin === 'http://example.com') {
      return true
    }

    if (unsafeLinkPrefix.some(prefix => url.protocol.toLowerCase().startsWith(prefix))) {
      return false
    }
  }
  catch {
    return false
  }

  return true
}

export function validateProp(attribute: string, value: string) {
  attribute = attribute.toLowerCase()
  if (attribute.startsWith('on') || unsafeAttributes.includes(attribute)) {
    return false
  }

  if (attribute === 'href' || attribute === 'src') {
    return isAnchorLinkAllowed(value)
  }

  return true
}

export function validateProps(type: string, props?: Record<string, any>) {
  /**
   * If the tag is marked as unsafe, drop all props
   */
  if (unsafeTags.includes(type)) {
    return {}
  }

  if (!props) {
    return {}
  }
  props = Object.fromEntries(
    Object.entries(props).filter(([name, value]) => {
      const isValid = validateProp(name, value)

      if (name === 'id' && !value) {
        return false
      }

      if (!isValid) {
        console.warn(`[@nuxtjs/mdc] removing unsafe attribute: ${name}="${value}"`)
      }

      return isValid
    }),
  )

  if (type === 'pre') {
    if (typeof props.highlights === 'string') {
      props.highlights = props.highlights.split(' ').map(i => Number.parseInt(i))
    }
  }

  if (props.className) {
    // merge className with class attribute
    // className mightbe array or string but class attribute is always a string
    if (Array.isArray(props.className)) {
      props.class = props.className.join(' ')
    }
    else {
      props.class = props.className
    }
    delete props.className
  }

  return props
}

const SPECIAL_SCHEME = /^(?:https?|wss?|ftp|file):$/

/** Whether every `open` has a matching `close`; a backslash escapes when `escapes`. */
function isBalanced(value: string, open: string, close: string, escapes: boolean): boolean {
  let depth = 0
  for (let i = 0; i < value.length; i++) {
    if (escapes && value[i] === '\\') i++
    else if (value[i] === open) depth++
    else if (value[i] === close && --depth < 0) return false
  }
  return depth === 0
}

/**
 * Write a URL as a link destination that reads back as the URL the security
 * plugin checked. `\` and `<` / `>` are escaped, `&` only where it would start
 * an entity, parentheses only when unbalanced (so `Foo_(bar)` stays readable),
 * and whitespace and control characters are percent-encoded.
 */
export function linkDestination(url: unknown): string {
  // With nothing between `(` and a title, `( "title")` reads the title as the URL
  if (url === undefined || url === null || url === '') return '<>'
  let value = String(url)

  // Browsers read `\` as `/` in special URLs, but a markdown reader encodes it as
  // `%5C`: `https://a.com\@evil.com` would move from a.com to evil.com.
  if (value.includes('\\')) {
    try {
      const parsed = new URL(value)
      if (SPECIAL_SCHEME.test(parsed.protocol)) value = parsed.href
    } catch {
      // Relative: `%5C` keeps it on the page's origin
    }
  }

  const escapeParens = !isBalanced(value, '(', ')', false)
  let result = ''
  for (let i = 0; i < value.length; i++) {
    const char = value[i]
    const code = value.charCodeAt(i)
    if (code <= 0x20 || code === 0x7f) {
      result += `%${code.toString(16).toUpperCase().padStart(2, '0')}`
    } else if (
      char === '\\' ||
      char === '<' ||
      char === '>' ||
      (escapeParens && (char === '(' || char === ')')) ||
      (char === '&' && /^&#?[a-z0-9]+;/i.test(value.slice(i, i + 34)))
    ) {
      result += `\\${char}`
    } else {
      result += char
    }
  }
  return result
}

/** Escape a link title for `"…"`. `<` / `&` too, so it stays text if the link ever fails to parse. */
export function linkTitle(title: unknown): string {
  return String(title).replace(/["\\<&]/g, '\\$&')
}

/**
 * Image alt text. The parser keeps it as markdown source (`a\](b)`), so it is
 * written as-is; only unbalanced brackets, which the parser cannot produce,
 * are escaped so they cannot close the alt and start a new link.
 */
export function imageAlt(alt: unknown): string {
  const value = String(alt)
  return isBalanced(value, '[', ']', true) ? value : value.replace(/(?<!\\)[[\]]/g, '\\$&')
}

/** Whether `url` can be written as an autolink `<url>`. */
export function isAutolinkSafe(url: string): boolean {
  return /^[a-z][a-z0-9+.-]{1,31}:[^\s<>\\]*$/i.test(url)
}

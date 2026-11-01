// Adapted from markdown-exit's html_re, with two changes: attribute values may be
// a balanced `{…}` expression (JSX style), and a comment may end in `--->` as in HTML.

const attr_name = '[a-zA-Z_:][a-zA-Z0-9:._-]*'

const braces = (depth: number): string => (depth === 0 ? '[^{}]*' : `(?:[^{}]|\\{${braces(depth - 1)}\\})*`)

/** Source of a `{…}` attribute value. Nesting is limited to four levels. */
export const braced_value = `\\{${braces(3)}\\}`

const unquoted = '[^"\'=<>`\\x00-\\x20]+'
const single_quoted = "'[^']*'"
const double_quoted = '"[^"]*"'

const attr_value = `(?:${braced_value}|${unquoted}|${single_quoted}|${double_quoted})`

const attribute = `(?:\\s+${attr_name}(?:\\s*=\\s*${attr_value})?)`

const open_tag = `<[A-Za-z][A-Za-z0-9\\-]*${attribute}*\\s*\\/?>`

const close_tag = '<\\/[A-Za-z][A-Za-z0-9\\-]*\\s*>'
const comment = '<!--(?:-?>|[\\s\\S]*?-->)'
const processing = '<[?][\\s\\S]*?[?]>'
const declaration = '<![A-Za-z][^>]*>'
const cdata = '<!\\[CDATA\\[[\\s\\S]*?\\]\\]>'

export const HTML_TAG_RE = new RegExp(`^(?:${open_tag}|${close_tag}|${comment}|${processing}|${declaration}|${cdata})`)

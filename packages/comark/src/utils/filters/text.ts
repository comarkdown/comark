import type { BindingFilters } from './types.ts'

const str = (v: unknown): string => (v == null ? '' : String(v))

function splitByCase(s: string): string[] {
  const parts: string[] = []
  let buf = ''
  let prevUpper: boolean | undefined
  let prevSep: boolean | undefined
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    const code = c.charCodeAt(0)
    const isSep = c === '-' || c === '_' || c === '/' || c === '.'
    if (isSep) {
      parts.push(buf)
      buf = ''
      prevUpper = undefined
      prevSep = true
      continue
    }
    const isNum = code >= 48 && code <= 57
    const isUpper = isNum ? undefined : code >= 65 && code <= 90
    if (prevSep === false) {
      if (prevUpper === false && isUpper === true) {
        parts.push(buf)
        buf = c
        prevUpper = isUpper
        continue
      }
      if (prevUpper === true && isUpper === false && buf.length > 1) {
        const last = buf[buf.length - 1]
        parts.push(buf.slice(0, buf.length - 1))
        buf = last + c
        prevUpper = isUpper
        continue
      }
    }
    buf += c
    prevUpper = isUpper
    prevSep = isSep
  }
  parts.push(buf)
  return parts
}

const toPascal = (s: string) =>
  s
    ? splitByCase(s)
        .map((p) => (p ? p[0].toUpperCase() + p.slice(1) : ''))
        .join('')
    : ''
const toCamel = (s: string) => {
  const p = toPascal(s)
  return p ? p[0].toLowerCase() + p.slice(1) : ''
}
const toKebab = (s: string) =>
  s
    ? splitByCase(s)
        .map((p) => p.toLowerCase())
        .join('-')
    : ''
const toSnake = (s: string) =>
  s
    ? splitByCase(s)
        .map((p) => p.toLowerCase())
        .join('_')
    : ''

export const textFilters: BindingFilters = {
  camel: (v) => toCamel(str(v)),
  capitalize: (v) => {
    const s = str(v)
    return s ? s[0].toUpperCase() + s.slice(1).toLowerCase() : s
  },
  decode_uri: (v) => {
    try {
      return decodeURIComponent(str(v))
    } catch {
      return str(v)
    }
  },
  encode_uri: (v) => encodeURIComponent(str(v)),
  indent: (v, spaces) => {
    const pad = ' '.repeat(typeof spaces === 'number' && spaces >= 0 ? spaces : 2)
    return str(v)
      .split('\n')
      .map((line) => (line ? pad + line : line))
      .join('\n')
  },
  kebab: (v) => toKebab(str(v)),
  lower: (v) => str(v).toLowerCase(),
  pascal: (v) => toPascal(str(v)),
  replace: (v, search, replacement = '') => {
    const s = str(v)
    const searchStr = str(search)
    const replStr = str(replacement)
    if (searchStr.startsWith('/') && searchStr.lastIndexOf('/') > 0) {
      const end = searchStr.lastIndexOf('/')
      const pattern = searchStr.slice(1, end)
      const flags = searchStr.slice(end + 1)
      try {
        return s.replace(new RegExp(pattern, flags), replStr)
      } catch {
        return s
      }
    }
    // Replace all occurrences without regex
    if (!searchStr) return s
    const out: string[] = []
    let pos = 0
    while (pos <= s.length) {
      const idx = s.indexOf(searchStr, pos)
      if (idx === -1) {
        out.push(s.slice(pos))
        break
      }
      out.push(s.slice(pos, idx), replStr)
      pos = idx + searchStr.length
    }
    return out.join('')
  },
  safe_name: (v) => {
    const s = str(v)
    let result = ''
    for (let i = 0; i < s.length; i++) {
      const c = s[i]
      const code = c.charCodeAt(0)
      const ok = (code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
      result += ok || c === '-' || c === '_' || c === '.' || c === ' ' ? c : '_'
    }
    return result.trim()
  },
  snake: (v) => toSnake(str(v)),
  title: (v) =>
    str(v)
      .split(' ')
      .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
      .join(' '),
  trim: (v) => str(v).trim(),
  truncate: (v, length, suffix = '…') => {
    const s = str(v)
    const n = typeof length === 'number' ? length : Number(length)
    if (!Number.isFinite(n) || n < 0) return s
    if (s.length <= n) return s
    const suf = str(suffix)
    return s.slice(0, Math.max(0, n - suf.length)) + suf
  },
  truncatewords: (v, count, suffix = '…') => {
    const s = str(v)
    const n = typeof count === 'number' ? count : Number(count)
    if (!Number.isFinite(n) || n < 0) return s
    const words = s.split(' ')
    if (words.length <= n) return s
    return words.slice(0, n).join(' ') + str(suffix)
  },
  uncamel: (v) => {
    const s = str(v)
    let result = ''
    for (let i = 0; i < s.length; i++) {
      const code = s.charCodeAt(i)
      const isUpper = code >= 65 && code <= 90
      if (isUpper && i > 0) result += ' '
      result += isUpper ? s[i].toLowerCase() : s[i]
    }
    return result
  },
  unescape: (v) => {
    const s = str(v)
    let result = ''
    let i = 0
    while (i < s.length) {
      if (s[i] === '\\' && i + 1 < s.length) {
        const next = s[i + 1]
        if (next === 'n') {
          result += '\n'
          i += 2
          continue
        }
        if (next === 't') {
          result += '\t'
          i += 2
          continue
        }
        if (next === 'r') {
          result += '\r'
          i += 2
          continue
        }
        if (next === '"') {
          result += '"'
          i += 2
          continue
        }
        if (next === "'") {
          result += "'"
          i += 2
          continue
        }
        if (next === '\\') {
          result += '\\'
          i += 2
          continue
        }
      }
      result += s[i]
      i++
    }
    return result
  },
  upper: (v) => str(v).toUpperCase(),
}

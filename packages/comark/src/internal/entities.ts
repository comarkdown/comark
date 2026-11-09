import { setNamedEntities } from 'markdown-exit/core'

const own = Object.prototype.hasOwnProperty

// The named character reference table is about 12 KiB gzip, so it loads only
// when a document has `&` followed by a letter. markdown-exit/core decodes
// with the same table, so bundles hold one copy.
let characterEntities: Record<string, string> | undefined
let legacy: Set<string> | undefined
let loading: Promise<void> | undefined

/** Whether `markdown` may hold a named character reference, which needs the table. */
export function needsEntities(markdown: string): boolean {
  return !characterEntities && /&[a-z]/i.test(markdown)
}

/** Loads the named character reference table for Comark and markdown-exit, once. */
export function loadEntities(): Promise<void> {
  loading ??= Promise.all([import('character-entities'), import('character-entities-legacy')]).then(
    ([entities, legacyNames]) => {
      characterEntities = entities.characterEntities
      legacy = new Set(legacyNames.characterEntitiesLegacy)
      setNamedEntities(characterEntities)
    },
    (error) => {
      // Try again on the next parse.
      loading = undefined
      throw error
    }
  )
  return loading
}

// HTML maps C1 control code points to their windows-1252 characters.
const C1: Record<number, number> = {
  0x80: 0x20ac,
  0x82: 0x201a,
  0x83: 0x0192,
  0x84: 0x201e,
  0x85: 0x2026,
  0x86: 0x2020,
  0x87: 0x2021,
  0x88: 0x02c6,
  0x89: 0x2030,
  0x8a: 0x0160,
  0x8b: 0x2039,
  0x8c: 0x0152,
  0x8e: 0x017d,
  0x91: 0x2018,
  0x92: 0x2019,
  0x93: 0x201c,
  0x94: 0x201d,
  0x95: 0x2022,
  0x96: 0x2013,
  0x97: 0x2014,
  0x98: 0x02dc,
  0x99: 0x2122,
  0x9a: 0x0161,
  0x9b: 0x203a,
  0x9c: 0x0153,
  0x9e: 0x017e,
  0x9f: 0x0178,
}

function isDigit(code: number): boolean {
  return code >= 48 && code <= 57
}

function isHexDigit(code: number): boolean {
  return isDigit(code) || (code >= 65 && code <= 70) || (code >= 97 && code <= 102)
}

function isAlphanumeric(code: number): boolean {
  return isDigit(code) || (code >= 65 && code <= 90) || (code >= 97 && code <= 122)
}

function fromNumericReference(value: number): string {
  if (value === 0 || value > 0x10ffff || (value >= 0xd800 && value <= 0xdfff)) return '�'
  return String.fromCodePoint(C1[value] ?? value)
}

/**
 * Decode character references in an attribute value the way browsers do:
 * numeric references, named references, and the legacy names (`&amp`, `&lt`,
 * `&copy`, …) allowed without a trailing semicolon, unless `=` or an
 * alphanumeric follows them (`?a=1&copy=2` stays literal).
 */
export function decodeHTMLAttribute(input: string): string {
  let amp = input.indexOf('&')
  if (amp === -1) return input

  let out = ''
  let last = 0
  const length = input.length

  while (amp !== -1) {
    let end = amp + 1
    let decoded: string | undefined

    if (input.charCodeAt(end) === 35 /* # */) {
      end++
      const hex = (input.charCodeAt(end) | 0x20) === 120 /* x */
      if (hex) end++
      const start = end
      const isValid = hex ? isHexDigit : isDigit
      let value = 0
      while (end < length && isValid(input.charCodeAt(end))) {
        // Clamped so overlong references stay out of range.
        value = Math.min(value * (hex ? 16 : 10) + Number.parseInt(input[end], 16), 0x110000)
        end++
      }
      if (end > start) {
        decoded = fromNumericReference(value)
        if (input.charCodeAt(end) === 59 /* ; */) end++
      }
    } else if (characterEntities && legacy) {
      while (end < length && isAlphanumeric(input.charCodeAt(end))) end++
      const name = input.slice(amp + 1, end)
      const next = input.charCodeAt(end)
      if (next === 59 /* ; */ && own.call(characterEntities, name)) {
        decoded = characterEntities[name]
        end++
      } else if (next !== 61 /* = */ && legacy.has(name)) {
        // Any shorter legacy prefix of `name` is followed by an alphanumeric, which keeps it literal.
        decoded = characterEntities[name]
      }
    }

    if (decoded !== undefined) {
      out += input.slice(last, amp) + decoded
      last = end
    }
    amp = input.indexOf('&', decoded === undefined ? amp + 1 : end)
  }

  return out + input.slice(last)
}

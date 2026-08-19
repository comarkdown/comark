import { describe, expect, it } from 'vitest'
import { decodeYamlTypedValue, encodeYamlTypedValue, parseYaml } from '../src/internal/yaml'

describe('parseYaml', () => {
  describe('empty documents resolve to undefined', () => {
    it('returns undefined for an empty string', () => {
      expect(parseYaml('')).toBeUndefined()
    })

    it('returns undefined for spaces only', () => {
      expect(parseYaml('   ')).toBeUndefined()
    })

    it('returns undefined for a tab', () => {
      expect(parseYaml('\t')).toBeUndefined()
    })

    it('returns undefined for mixed whitespace', () => {
      expect(parseYaml('\t\n ')).toBeUndefined()
    })

    it('returns undefined for newlines only', () => {
      expect(parseYaml('\n\n')).toBeUndefined()
    })

    it('returns undefined for a single comment line', () => {
      expect(parseYaml('# only a comment')).toBeUndefined()
    })

    it('returns undefined for multiple comment lines', () => {
      expect(parseYaml('# first comment\n# second comment\n')).toBeUndefined()
    })
  })

  describe('valid YAML parses normally', () => {
    it('parses a flat mapping', () => {
      expect(parseYaml('a: 1\nb: two')).toEqual({ a: 1, b: 'two' })
    })

    it('parses nested objects and arrays', () => {
      const yaml = `title: Nested
meta:
  description: A description
  keywords:
    - one
    - two`
      expect(parseYaml(yaml)).toEqual({
        title: 'Nested',
        meta: {
          description: 'A description',
          keywords: ['one', 'two'],
        },
      })
    })
  })

  describe('falsy scalar documents are preserved, not coerced', () => {
    it('returns the number 0 for a bare "0" document', () => {
      expect(parseYaml('0')).toBe(0)
    })

    it('returns false for a bare "false" document', () => {
      expect(parseYaml('false')).toBe(false)
    })

    it('returns null for a bare "null" document', () => {
      expect(parseYaml('null')).toBeNull()
    })
  })

  describe('malformed YAML still throws', () => {
    it('throws on an unterminated flow sequence', () => {
      expect(() => parseYaml('foo: [1,2')).toThrow()
    })

    it('throws on a structural indentation error', () => {
      expect(() =>
        parseYaml(`foo:
  bar: 1
 baz: 2`)
      ).toThrow()
    })

    it('throws when the input contains more than one document', () => {
      expect(() => parseYaml('x: 1\n---\ny: 2')).toThrow()
    })
  })
})

describe('encodeYamlTypedValue / decodeYamlTypedValue', () => {
  describe('round-trips every YAML value type', () => {
    it.each([
      ['number', 3],
      ['negative number', -1.5],
      ['zero', 0],
      ['true', true],
      ['false', false],
      ['null', null],
      ['object', { x: 1, y: true }],
      ['array', [1, 'two', false]],
      ['empty object', {}],
      ['empty array', []],
    ] as const)('restores a %s value to its original type', (_label, value) => {
      const encoded = encodeYamlTypedValue(value)
      expect(typeof encoded).toBe('string')
      expect(decodeYamlTypedValue(encoded)).toEqual(value)
    })
  })

  describe('leaves genuine strings unchanged', () => {
    it('does not alter a plain string', () => {
      expect(decodeYamlTypedValue('hello')).toBe('hello')
    })

    it('does not alter an empty string', () => {
      expect(decodeYamlTypedValue('')).toBe('')
    })

    it('does not alter a string that looks like JSON but has no encoding prefix', () => {
      // This is the case `processAttributes`'s `{`/`[` heuristic already handles
      // for object/array values from other syntaxes. Decoding must not touch it.
      expect(decodeYamlTypedValue('{"a":1}')).toBe('{"a":1}')
      expect(decodeYamlTypedValue('[1,2,3]')).toBe('[1,2,3]')
    })

    it('does not alter a string that looks like a number or boolean', () => {
      // Explicitly-quoted YAML scalars (e.g. `count: "3"`) must stay strings.
      expect(decodeYamlTypedValue('3')).toBe('3')
      expect(decodeYamlTypedValue('false')).toBe('false')
    })
  })

  describe('fails safe on a malformed encoded value', () => {
    it('returns the original string when the encoded JSON is invalid', () => {
      const malformed = `${encodeYamlTypedValue(1)}garbage`
      expect(decodeYamlTypedValue(malformed)).toBe(malformed)
    })
  })

  describe('does not collide with a string containing the encoding prefix', () => {
    it('round-trips a string that starts with the raw prefix bytes', () => {
      // A quoted YAML scalar can contain a NUL byte via the `\0` escape, so a
      // genuine string value can start with the same bytes as the prefix.
      // `encodeYamlTypedValue` must still round-trip it correctly.
      const collidingString = `${String.fromCharCode(0)}yaml:true`
      const encoded = encodeYamlTypedValue(collidingString)
      expect(decodeYamlTypedValue(encoded)).toBe(collidingString)
    })
  })

  describe('values that JSON cannot represent', () => {
    // `parseYaml` can never produce these values (its `JSON_SCHEMA` has no
    // `NaN`/`Infinity`/`undefined` tag), so these document known behavior for
    // any future caller of these functions, not a live parsing path.

    it('collapses NaN to null, matching JSON.stringify', () => {
      expect(JSON.stringify(Number.NaN)).toBe('null')
      expect(decodeYamlTypedValue(encodeYamlTypedValue(Number.NaN))).toBeNull()
    })

    it('collapses Infinity to null, matching JSON.stringify', () => {
      expect(JSON.stringify(Number.POSITIVE_INFINITY)).toBe('null')
      expect(decodeYamlTypedValue(encodeYamlTypedValue(Number.POSITIVE_INFINITY))).toBeNull()
    })

    it('fails safe on undefined instead of round-tripping it', () => {
      // `JSON.stringify(undefined)` returns `undefined`, not a string, so the
      // encoded value degrades to the literal text "undefined", which is not
      // valid JSON. `decodeYamlTypedValue` then returns it unchanged.
      const encoded = encodeYamlTypedValue(undefined)
      expect(decodeYamlTypedValue(encoded)).toBe(encoded)
    })
  })
})

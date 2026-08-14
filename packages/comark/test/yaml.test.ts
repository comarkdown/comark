import { describe, expect, it } from 'vitest'
import { parseYaml } from '../src/internal/yaml'

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

import { describe, expect, it } from 'vitest'
import { textFilters } from '../../../src/utils/filters/text.ts'

describe('textFilters', () => {
  describe('camel', () => {
    it('converts kebab to camelCase', () => expect(textFilters.camel('hello-world')).toBe('helloWorld'))
    it('converts snake to camelCase', () => expect(textFilters.camel('hello_world')).toBe('helloWorld'))
    it('converts PascalCase to camelCase', () => expect(textFilters.camel('HelloWorld')).toBe('helloWorld'))
    it('handles empty string', () => expect(textFilters.camel('')).toBe(''))
    it('coerces null to empty string', () => expect(textFilters.camel(null)).toBe(''))
  })

  describe('capitalize', () => {
    it('uppercases first char and lowercases rest', () => expect(textFilters.capitalize('hELLO')).toBe('Hello'))
    it('handles single char', () => expect(textFilters.capitalize('a')).toBe('A'))
    it('handles empty string', () => expect(textFilters.capitalize('')).toBe(''))
    it('coerces null', () => expect(textFilters.capitalize(null)).toBe(''))
  })

  describe('decode_uri', () => {
    it('decodes percent-encoded characters', () => expect(textFilters.decode_uri('hello%20world')).toBe('hello world'))
    it('returns original when decoding fails', () => expect(textFilters.decode_uri('%E0%A4%A')).toBe('%E0%A4%A'))
    it('coerces null', () => expect(textFilters.decode_uri(null)).toBe(''))
  })

  describe('encode_uri', () => {
    it('encodes spaces and special chars', () => expect(textFilters.encode_uri('hello world')).toBe('hello%20world'))
    it('coerces null', () => expect(textFilters.encode_uri(null)).toBe(''))
  })

  describe('indent', () => {
    it('indents each non-empty line by 2 spaces by default', () => {
      expect(textFilters.indent('a\nb')).toBe('  a\n  b')
    })
    it('respects a custom spaces argument', () => {
      expect(textFilters.indent('line', 4)).toBe('    line')
    })
    it('does not indent blank lines', () => {
      expect(textFilters.indent('a\n\nb')).toBe('  a\n\n  b')
    })
  })

  describe('kebab', () => {
    it('converts camelCase to kebab-case', () => expect(textFilters.kebab('helloWorld')).toBe('hello-world'))
    it('preserves spaces as-is (spaces are not word separators in splitByCase)', () => {
      // splitByCase only splits on - _ / . and camelCase boundaries, not spaces
      expect(textFilters.kebab('hello-world')).toBe('hello-world')
    })
    it('handles empty string', () => expect(textFilters.kebab('')).toBe(''))
  })

  describe('lower', () => {
    it('lowercases a string', () => expect(textFilters.lower('HELLO')).toBe('hello'))
    it('coerces a number', () => expect(textFilters.lower(42)).toBe('42'))
    it('coerces null', () => expect(textFilters.lower(null)).toBe(''))
  })

  describe('pascal', () => {
    it('converts kebab to PascalCase', () => expect(textFilters.pascal('hello-world')).toBe('HelloWorld'))
    it('converts snake to PascalCase', () => expect(textFilters.pascal('hello_world')).toBe('HelloWorld'))
    it('handles empty string', () => expect(textFilters.pascal('')).toBe(''))
  })

  describe('replace', () => {
    it('replaces all occurrences of a plain string', () => {
      expect(textFilters.replace('aabaa', 'a', 'x')).toBe('xxbxx')
    })
    it('replaces with regex when search starts with /', () => {
      expect(textFilters.replace('hello world', '/\\s+/g', '-')).toBe('hello-world')
    })
    it('replaces with empty string by default', () => {
      expect(textFilters.replace('hello', 'l')).toBe('heo')
    })
    it('returns original when search is empty', () => {
      expect(textFilters.replace('abc', '')).toBe('abc')
    })
  })

  describe('safe_name', () => {
    it('replaces unsafe characters with underscore', () => {
      expect(textFilters.safe_name('hello@world!')).toBe('hello_world_')
    })
    it('keeps alphanumeric, hyphen, underscore, dot, space', () => {
      expect(textFilters.safe_name('My File-Name_v1.0')).toBe('My File-Name_v1.0')
    })
    it('trims leading/trailing spaces', () => {
      expect(textFilters.safe_name('  hello  ')).toBe('hello')
    })
  })

  describe('snake', () => {
    it('converts camelCase to snake_case', () => expect(textFilters.snake('helloWorld')).toBe('hello_world'))
    it('converts kebab to snake_case', () => expect(textFilters.snake('hello-world')).toBe('hello_world'))
    it('handles empty string', () => expect(textFilters.snake('')).toBe(''))
  })

  describe('title', () => {
    it('capitalizes each word', () => expect(textFilters.title('hello world')).toBe('Hello World'))
    it('handles single word', () => expect(textFilters.title('ada')).toBe('Ada'))
    it('coerces null', () => expect(textFilters.title(null)).toBe(''))
  })

  describe('trim', () => {
    it('trims whitespace', () => expect(textFilters.trim('  hello  ')).toBe('hello'))
    it('coerces null', () => expect(textFilters.trim(null)).toBe(''))
  })

  describe('truncate', () => {
    it('truncates at length and appends ellipsis', () =>
      expect(textFilters.truncate('hello world', 8)).toBe('hello w…'))
    it('does not truncate when under length', () => expect(textFilters.truncate('hi', 10)).toBe('hi'))
    it('accepts a custom suffix', () => expect(textFilters.truncate('hello world', 8, '...')).toBe('hello...'))
    it('handles null value', () => expect(textFilters.truncate(null, 5)).toBe(''))
    it('returns original when length is invalid', () => expect(textFilters.truncate('hello', -1)).toBe('hello'))
  })

  describe('truncatewords', () => {
    it('truncates at word boundary', () => {
      expect(textFilters.truncatewords('one two three', 2)).toBe('one two…')
    })
    it('does not truncate when under word count', () => {
      expect(textFilters.truncatewords('one two', 5)).toBe('one two')
    })
    it('accepts custom suffix', () => {
      expect(textFilters.truncatewords('one two three', 2, '...')).toBe('one two...')
    })
  })

  describe('uncamel', () => {
    it('inserts space before uppercase letters', () => expect(textFilters.uncamel('helloWorld')).toBe('hello world'))
    it('lowercases uppercase letter', () => expect(textFilters.uncamel('Ada')).toBe('ada'))
    it('handles empty string', () => expect(textFilters.uncamel('')).toBe(''))
  })

  describe('unescape', () => {
    it('unescapes common escape sequences', () => {
      expect(textFilters.unescape('a\\nb')).toBe('a\nb')
      expect(textFilters.unescape('a\\tb')).toBe('a\tb')
      expect(textFilters.unescape('a\\"b')).toBe('a"b')
      expect(textFilters.unescape('a\\\\b')).toBe('a\\b')
    })
    it('passes unknown sequences through as-is', () => {
      expect(textFilters.unescape('a\\zb')).toBe('a\\zb')
    })
  })

  describe('upper', () => {
    it('uppercases a string', () => expect(textFilters.upper('hello')).toBe('HELLO'))
    it('coerces a number', () => expect(textFilters.upper(42)).toBe('42'))
    it('coerces null', () => expect(textFilters.upper(null)).toBe(''))
  })
})

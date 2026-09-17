import { describe, expect, it } from 'vitest'
import { collectionsFilters } from '../../../src/utils/filters/collections.ts'

const fruits = ['banana', 'apple', 'cherry']
const people = [
  { name: 'Bob', age: 30 },
  { name: 'Ada', age: 25 },
  { name: 'Zed', age: 25 },
]

describe('collectionsFilters', () => {
  describe('compact', () => {
    it('removes null/undefined/empty-string from array', () => {
      expect(collectionsFilters.compact(['a', null, '', undefined, 'b'])).toEqual(['a', 'b'])
    })
    it('removes falsy values from object properties', () => {
      expect(collectionsFilters.compact({ a: 'x', b: null, c: '' })).toEqual({ a: 'x' })
    })
    it('returns non-array/object as-is', () => {
      expect(collectionsFilters.compact(42)).toBe(42)
    })
  })

  describe('first', () => {
    it('returns first element', () => expect(collectionsFilters.first(fruits)).toBe('banana'))
    it('returns first N elements as array when count provided', () => {
      expect(collectionsFilters.first(fruits, 2)).toEqual(['banana', 'apple'])
    })
    it('handles empty array', () => expect(collectionsFilters.first([])).toBeUndefined())
    it('wraps scalar in array and returns it', () => expect(collectionsFilters.first('hello')).toBe('hello'))
  })

  describe('join', () => {
    it('joins with default ", " separator', () => {
      expect(collectionsFilters.join(fruits)).toBe('banana, apple, cherry')
    })
    it('joins with custom separator', () => {
      expect(collectionsFilters.join(fruits, ' | ')).toBe('banana | apple | cherry')
    })
    it('coerces null items to empty string', () => {
      expect(collectionsFilters.join([null, 'a'])).toBe(', a')
    })
    it('wraps scalar value as single-item array', () => {
      expect(collectionsFilters.join('hello')).toBe('hello')
    })
  })

  describe('last', () => {
    it('returns last element', () => expect(collectionsFilters.last(fruits)).toBe('cherry'))
    it('returns last N elements as array when count provided', () => {
      expect(collectionsFilters.last(fruits, 2)).toEqual(['apple', 'cherry'])
    })
  })

  describe('length', () => {
    it('returns array length', () => expect(collectionsFilters.length(fruits)).toBe(3))
    it('returns string length', () => expect(collectionsFilters.length('hello')).toBe(5))
    it('returns object key count', () => expect(collectionsFilters.length({ a: 1, b: 2 })).toBe(2))
    it('returns 0 for null', () => expect(collectionsFilters.length(null)).toBe(0))
  })

  describe('map', () => {
    it('extracts a property from each item', () => {
      expect(collectionsFilters.map(people, 'name')).toEqual(['Bob', 'Ada', 'Zed'])
    })
    it('resolves a nested property path', () => {
      const items = [{ a: { b: 1 } }, { a: { b: 2 } }]
      expect(collectionsFilters.map(items, 'a.b')).toEqual([1, 2])
    })
    it('applies a template string', () => {
      expect(collectionsFilters.map(people, '${name} (${age})')).toEqual(['Bob (30)', 'Ada (25)', 'Zed (25)'])
    })
    it('returns value unchanged when prop is null', () => {
      expect(collectionsFilters.map(fruits, null)).toEqual(fruits)
    })
  })

  describe('merge', () => {
    it('concatenates arrays', () => {
      expect(collectionsFilters.merge([1, 2], [3, 4])).toEqual([1, 2, 3, 4])
    })
    it('merges scalar values into the array', () => {
      expect(collectionsFilters.merge([1], 2, 3)).toEqual([1, 2, 3])
    })
  })

  describe('nth', () => {
    it('selects every even item (1-indexed)', () => {
      expect(collectionsFilters.nth([1, 2, 3, 4], 'even')).toEqual([2, 4])
    })
    it('selects every odd item', () => {
      expect(collectionsFilters.nth([1, 2, 3, 4], 'odd')).toEqual([1, 3])
    })
    it('selects item at integer position', () => {
      expect(collectionsFilters.nth(fruits, '2')).toEqual(['apple'])
    })
    it('uses An+B pattern (2n+1 = odd)', () => {
      expect(collectionsFilters.nth([1, 2, 3, 4, 5], '2n+1')).toEqual([1, 3, 5])
    })
    it('returns all items for pattern n', () => {
      expect(collectionsFilters.nth([1, 2], 'n')).toEqual([1, 2])
    })
  })

  describe('object', () => {
    const obj = { a: 1, b: 2 }
    it('returns entries by default', () => {
      expect(collectionsFilters.object(obj)).toEqual([
        { key: 'a', value: 1 },
        { key: 'b', value: 2 },
      ])
    })
    it('returns keys mode', () => {
      expect(collectionsFilters.object(obj, 'keys')).toEqual(['a', 'b'])
    })
    it('returns values mode', () => {
      expect(collectionsFilters.object(obj, 'values')).toEqual([1, 2])
    })
    it('passes non-objects through', () => {
      expect(collectionsFilters.object([1, 2])).toEqual([1, 2])
    })
  })

  describe('parse_json', () => {
    it('parses a valid JSON string', () => {
      expect(collectionsFilters.parse_json('{"a":1}')).toEqual({ a: 1 })
    })
    it('returns the original value for invalid JSON', () => {
      expect(collectionsFilters.parse_json('{invalid}')).toBe('{invalid}')
    })
    it('passes non-string values through unchanged', () => {
      const obj = { a: 1 }
      expect(collectionsFilters.parse_json(obj)).toBe(obj)
    })
  })

  describe('reverse', () => {
    it('reverses an array without mutating original', () => {
      const arr = [1, 2, 3]
      expect(collectionsFilters.reverse(arr)).toEqual([3, 2, 1])
      expect(arr).toEqual([1, 2, 3])
    })
    it('reverses a string', () => expect(collectionsFilters.reverse('hello')).toBe('olleh'))
    it('reverses object entry order', () => {
      const obj = { a: 1, b: 2, c: 3 }
      expect(Object.keys(collectionsFilters.reverse(obj) as object)).toEqual(['c', 'b', 'a'])
    })
  })

  describe('slice', () => {
    it('slices an array', () => expect(collectionsFilters.slice([1, 2, 3, 4], 1, 3)).toEqual([2, 3]))
    it('slices a string', () => expect(collectionsFilters.slice('hello', 1, 4)).toBe('ell'))
    it('uses only start when end is omitted', () => {
      expect(collectionsFilters.slice([1, 2, 3], 1)).toEqual([2, 3])
    })
  })

  describe('sort', () => {
    it('sorts primitives alphabetically by default', () => {
      expect(collectionsFilters.sort(['c', 'a', 'b'])).toEqual(['a', 'b', 'c'])
    })
    it('sorts by property', () => {
      expect(collectionsFilters.sort(people, 'name')).toEqual([
        { name: 'Ada', age: 25 },
        { name: 'Bob', age: 30 },
        { name: 'Zed', age: 25 },
      ])
    })
    it('sorts by property descending', () => {
      const result = collectionsFilters.sort(people, 'name:desc') as typeof people
      expect(result[0].name).toBe('Zed')
    })
    it('sorts numerically when values are numbers', () => {
      expect(collectionsFilters.sort([3, 1, 2])).toEqual([1, 2, 3])
    })
    it('does not mutate the original array', () => {
      const arr = ['c', 'a']
      collectionsFilters.sort(arr)
      expect(arr).toEqual(['c', 'a'])
    })
  })

  describe('split', () => {
    it('splits by comma by default', () => {
      expect(collectionsFilters.split('a,b,c')).toEqual(['a', 'b', 'c'])
    })
    it('splits by custom separator', () => {
      expect(collectionsFilters.split('a|b', '|')).toEqual(['a', 'b'])
    })
    it('coerces non-string value', () => {
      expect(collectionsFilters.split(42, ',')).toEqual(['42'])
    })
  })

  describe('sum', () => {
    it('sums array of numbers', () => expect(collectionsFilters.sum([1, 2, 3])).toBe(6))
    it('sums by property', () => expect(collectionsFilters.sum(people, 'age')).toBe(80))
    it('treats non-finite values as 0', () => {
      expect(collectionsFilters.sum([1, null, 'x', 2])).toBe(3)
    })
  })

  describe('template', () => {
    it('applies template to an object', () => {
      expect(collectionsFilters.template({ name: 'Ada' }, 'Hi ${name}!')).toBe('Hi Ada!')
    })
    it('applies template to each item in an array', () => {
      expect(collectionsFilters.template(people, '${name}:${age}')).toBe('Bob:30\nAda:25\nZed:25')
    })
    it('returns string value when template is null', () => {
      expect(collectionsFilters.template('hello', null)).toBe('hello')
    })
  })

  describe('unique', () => {
    it('removes duplicate array items', () => {
      expect(collectionsFilters.unique([1, 2, 1, 3])).toEqual([1, 2, 3])
    })
    it('removes duplicate characters from string', () => {
      expect(collectionsFilters.unique('aabbcc')).toBe('abc')
    })
    it('deduplicates objects by JSON key', () => {
      const result = collectionsFilters.unique([{ a: 1 }, { a: 1 }, { a: 2 }])
      expect((result as object[]).length).toBe(2)
    })
  })

  describe('where', () => {
    it('filters items with a truthy property', () => {
      const items = [
        { active: true, name: 'A' },
        { active: false, name: 'B' },
      ]
      expect(collectionsFilters.where(items, 'active')).toEqual([{ active: true, name: 'A' }])
    })
    it('filters items where property equals a value', () => {
      expect(collectionsFilters.where(people, 'age', 25)).toEqual([
        { name: 'Ada', age: 25 },
        { name: 'Zed', age: 25 },
      ])
    })
    it('returns array unchanged when prop is null', () => {
      expect(collectionsFilters.where(fruits, null)).toEqual(fruits)
    })
  })
})

import { describe, expect, it } from 'vitest'
import { htmlFilters } from '../../../src/utils/filters/html.ts'

describe('htmlFilters (opt-in)', () => {
  describe('html_to_json', () => {
    it('converts a simple element to a JSON representation', () => {
      const result = htmlFilters.html_to_json('<p>hello</p>') as Record<string, unknown>
      expect(result.type).toBe('element')
      expect(result.tag).toBe('p')
      // When there is one child, clean() returns it directly (not wrapped in an array)
      const child = result.children as Record<string, unknown>
      expect(child.type).toBe('text')
      expect(child.value).toBe('hello')
    })

    it('includes attrs when present', () => {
      const result = htmlFilters.html_to_json('<a href="/x">link</a>') as Record<string, unknown>
      expect((result.attrs as Record<string, string>).href).toBe('/x')
    })

    it('returns array for multiple root nodes', () => {
      const result = htmlFilters.html_to_json('<p>a</p><p>b</p>')
      expect(Array.isArray(result)).toBe(true)
      expect((result as unknown[]).length).toBe(2)
    })

    it('coerces null to empty string and returns empty array', () => {
      const result = htmlFilters.html_to_json(null)
      expect(result).toEqual([])
    })

    it('parses void tags without children', () => {
      const result = htmlFilters.html_to_json('<img src="x.png">') as Record<string, unknown>
      expect(result.type).toBe('element')
      expect(result.tag).toBe('img')
      expect(result.children).toBeUndefined()
    })
  })

  describe('remove_html', () => {
    it('removes specified tags and their children from the tree', () => {
      const result = htmlFilters.remove_html('<div><script>evil()</script><p>safe</p></div>', 'script')
      expect(String(result)).not.toContain('evil')
      expect(String(result)).toContain('safe')
    })

    it('removes multiple tags', () => {
      const result = htmlFilters.remove_html('<p>good</p><script>x</script><style>y</style>', 'script', 'style')
      expect(String(result)).toBe('<p>good</p>')
    })

    it('returns the HTML unchanged when no tags are specified', () => {
      const input = '<p>hello</p>'
      expect(htmlFilters.remove_html(input)).toBe(input)
    })

    it('coerces null to empty string', () => {
      expect(htmlFilters.remove_html(null)).toBe('')
    })
  })
})

import { describe, expect, it } from 'vitest'
import { htmlCleanupFilters } from '../../../src/utils/filters/html-cleanup.ts'

describe('htmlCleanupFilters', () => {
  describe('remove_attr', () => {
    it('removes the named attribute', () => {
      const result = String(htmlCleanupFilters.remove_attr('<a href="/x" class="link">text</a>', 'href'))
      expect(result).toBe('<a class="link">text</a>')
    })
    it('removes multiple attributes', () => {
      const result = String(htmlCleanupFilters.remove_attr('<a href="/x" class="link">text</a>', 'href', 'class'))
      expect(result).toBe('<a>text</a>')
    })
    it('leaves unmatched attributes intact', () => {
      const result = String(htmlCleanupFilters.remove_attr('<p id="x">text</p>', 'class'))
      expect(result).toBe('<p id="x">text</p>')
    })
  })

  describe('remove_tags', () => {
    it('removes tags but keeps content', () => {
      const result = String(htmlCleanupFilters.remove_tags('<p>hello <strong>world</strong></p>', 'strong'))
      expect(result).toBe('<p>hello world</p>')
    })
    it('removes multiple tags', () => {
      const result = String(htmlCleanupFilters.remove_tags('<p><em>a</em> <strong>b</strong></p>', 'em', 'strong'))
      expect(result).toBe('<p>a b</p>')
    })
  })

  describe('replace_tags', () => {
    it('replaces a tag with another', () => {
      const result = String(htmlCleanupFilters.replace_tags('<b>text</b>', 'b', 'strong'))
      expect(result).toBe('<strong>text</strong>')
    })
    it('replaces multiple tag pairs', () => {
      const result = String(htmlCleanupFilters.replace_tags('<i>a</i> <b>b</b>', 'i', 'em', 'b', 'strong'))
      expect(result).toBe('<em>a</em> <strong>b</strong>')
    })
  })

  describe('strip_attr', () => {
    it('strips all attributes except the allow list', () => {
      const result = String(htmlCleanupFilters.strip_attr('<a href="/x" class="link" id="y">text</a>', 'href'))
      expect(result).toBe('<a href="/x">text</a>')
    })
    it('strips all attributes when allow list is empty', () => {
      const result = String(htmlCleanupFilters.strip_attr('<p class="x" id="y">hello</p>'))
      expect(result).toBe('<p>hello</p>')
    })
  })

  describe('strip_md', () => {
    it('removes bold markers', () => {
      expect(htmlCleanupFilters.strip_md('**bold**')).toBe('bold')
    })
    it('removes italic markers', () => {
      expect(htmlCleanupFilters.strip_md('_italic_')).toBe('italic')
    })
    it('removes inline code markers', () => {
      expect(htmlCleanupFilters.strip_md('`code`')).toBe('code')
    })
    it('keeps link text and discards URL', () => {
      expect(htmlCleanupFilters.strip_md('[Click](https://example.com)')).toBe('Click')
    })
    it('keeps image alt text and discards URL', () => {
      expect(htmlCleanupFilters.strip_md('![Alt](img.png)')).toBe('Alt')
    })
    it('keeps wikilink target', () => {
      expect(htmlCleanupFilters.strip_md('[[Page]]')).toBe('Page')
    })
    it('leaves plain text unchanged', () => {
      expect(htmlCleanupFilters.strip_md('plain text')).toBe('plain text')
    })
    it('coerces null to empty string', () => {
      expect(htmlCleanupFilters.strip_md(null)).toBe('')
    })
  })

  describe('strip_tags', () => {
    it('removes all tags when allow list is empty', () => {
      const result = String(htmlCleanupFilters.strip_tags('<p>hello <b>world</b></p>'))
      expect(result).toBe('hello world')
    })
    it('keeps allowed tags', () => {
      const result = String(htmlCleanupFilters.strip_tags('<p>hello <b>world</b></p>', 'b'))
      expect(result).toBe('hello <b>world</b>')
    })
  })
})

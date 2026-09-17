import { describe, expect, it } from 'vitest'
import { formattingFilters } from '../../../src/utils/filters/formatting.ts'

describe('formattingFilters', () => {
  describe('blockquote', () => {
    it('prefixes each line with "> "', () => {
      expect(formattingFilters.blockquote('hello\nworld')).toBe('> hello\n> world')
    })
    it('handles single line', () => expect(formattingFilters.blockquote('hi')).toBe('> hi'))
  })

  describe('bold', () => {
    it('wraps in **', () => expect(formattingFilters.bold('text')).toBe('**text**'))
    it('coerces null', () => expect(formattingFilters.bold(null)).toBe('****'))
  })

  describe('callout', () => {
    it('creates a note callout by default', () => {
      const result = String(formattingFilters.callout('body'))
      expect(result).toContain('[!note]')
      expect(result).toContain('> body')
    })
    it('uses the provided type', () => {
      const result = String(formattingFilters.callout('body', 'warning'))
      expect(result).toContain('[!warning]')
    })
    it('includes title when provided', () => {
      const result = String(formattingFilters.callout('body', 'info', 'Title'))
      expect(result).toContain('[!info] Title')
    })
  })

  describe('code', () => {
    it('wraps in backtick when no lang provided', () => {
      expect(formattingFilters.code('hello')).toBe('`hello`')
    })
    it('wraps in fenced block when lang provided', () => {
      const result = String(formattingFilters.code('const x = 1', 'js'))
      expect(result).toBe('```js\nconst x = 1\n```')
    })
  })

  describe('code_block', () => {
    it('always creates a fenced block', () => {
      const result = String(formattingFilters.code_block('x = 1', 'python'))
      expect(result).toBe('```python\nx = 1\n```')
    })
    it('uses empty lang by default', () => {
      expect(formattingFilters.code_block('hi')).toBe('```\nhi\n```')
    })
  })

  describe('comment', () => {
    it('wraps in HTML comment', () => expect(formattingFilters.comment('note')).toBe('<!-- note -->'))
  })

  describe('embed', () => {
    it('creates Obsidian embed syntax', () => expect(formattingFilters.embed('file.md')).toBe('![[file.md]]'))
  })

  describe('escape_md', () => {
    it('escapes special Markdown characters', () => {
      const result = String(formattingFilters.escape_md('**bold** and [link](url)'))
      expect(result).not.toContain('**bold**')
      expect(result).toContain('\\*\\*bold\\*\\*')
    })
  })

  describe('footnote', () => {
    it('creates a single footnote', () => {
      expect(formattingFilters.footnote('Content', 'note')).toBe('[^note]: Content')
    })
    it('uses default label "1" when none provided', () => {
      expect(formattingFilters.footnote('Content')).toBe('[^1]: Content')
    })
    it('creates multiple footnotes from an array', () => {
      const result = String(formattingFilters.footnote(['A', 'B'], 'fn'))
      expect(result).toBe('[^fn-1]: A\n[^fn-2]: B')
    })
  })

  describe('h1–h6', () => {
    it('creates headings at the correct level', () => {
      expect(formattingFilters.h1('Title')).toBe('# Title')
      expect(formattingFilters.h2('Sub')).toBe('## Sub')
      expect(formattingFilters.h3('Sub')).toBe('### Sub')
      expect(formattingFilters.h4('Sub')).toBe('#### Sub')
      expect(formattingFilters.h5('Sub')).toBe('##### Sub')
      expect(formattingFilters.h6('Sub')).toBe('###### Sub')
    })
  })

  describe('hard_break', () => {
    it('inserts two trailing spaces before newlines', () => {
      expect(formattingFilters.hard_break('a\nb')).toBe('a  \nb')
    })
  })

  describe('highlight', () => {
    it('wraps in ==', () => expect(formattingFilters.highlight('text')).toBe('==text=='))
  })

  describe('hr', () => {
    it('appends --- after value by default', () => {
      expect(formattingFilters.hr('text')).toBe('text\n---')
    })
    it('prepends when position is "before"', () => {
      expect(formattingFilters.hr('text', 'before')).toBe('---\ntext')
    })
    it('wraps when position is "both"', () => {
      expect(formattingFilters.hr('text', 'both')).toBe('---\ntext\n---')
    })
  })

  describe('image', () => {
    it('creates image from URL string', () => {
      expect(formattingFilters.image('img.png')).toBe('![](img.png)')
    })
    it('uses alt and url args', () => {
      expect(formattingFilters.image(null, 'Alt', 'img.png')).toBe('![Alt](img.png)')
    })
    it('accepts object with url and alt', () => {
      expect(formattingFilters.image({ url: 'img.png', alt: 'Alt' })).toBe('![Alt](img.png)')
    })
  })

  describe('italic', () => {
    it('wraps in *', () => expect(formattingFilters.italic('text')).toBe('*text*'))
  })

  describe('link', () => {
    it('creates link from string URL', () => {
      expect(formattingFilters.link('https://example.com')).toBe('[https://example.com](https://example.com)')
    })
    it('uses text and url args', () => {
      expect(formattingFilters.link(null, 'Click', 'https://example.com')).toBe('[Click](https://example.com)')
    })
    it('accepts object with title and url', () => {
      expect(formattingFilters.link({ title: 'Example', url: 'https://example.com' })).toBe(
        '[Example](https://example.com)'
      )
    })
  })

  describe('list', () => {
    it('creates an unordered list from array', () => {
      expect(formattingFilters.list(['a', 'b', 'c'])).toBe('- a\n- b\n- c')
    })
    it('uses custom marker', () => {
      expect(formattingFilters.list(['x'], '*')).toBe('* x')
    })
    it('wraps scalar in single-item list', () => {
      expect(formattingFilters.list('item')).toBe('- item')
    })
  })

  describe('math', () => {
    it('wraps in $ for inline math', () => expect(formattingFilters.math('x^2')).toBe('$x^2$'))
  })

  describe('math_block', () => {
    it('wraps in $$ block', () => {
      expect(formattingFilters.math_block('x^2')).toBe('$$\nx^2\n$$')
    })
  })

  describe('strike', () => {
    it('wraps in ~~', () => expect(formattingFilters.strike('text')).toBe('~~text~~'))
  })

  describe('table', () => {
    it('creates a Markdown table from array of objects', () => {
      const result = String(formattingFilters.table([{ name: 'Ada', age: 25 }]))
      expect(result).toContain('| name | age |')
      expect(result).toContain('| Ada | 25 |')
    })
    it('creates a single-column table from array of primitives', () => {
      const result = String(formattingFilters.table(['a', 'b']))
      expect(result).toContain('| Value |')
      expect(result).toContain('| a |')
    })
    it('returns empty string for empty array', () => {
      expect(formattingFilters.table([])).toBe('')
    })
  })

  describe('table_pretty', () => {
    it('aligns columns with padding', () => {
      const result = String(formattingFilters.table_pretty([{ name: 'Ada', role: 'admin' }]))
      expect(result).toContain('name')
      expect(result).toContain('role')
    })
  })

  describe('wikilink', () => {
    it('creates a wikilink', () => expect(formattingFilters.wikilink('Page')).toBe('[[Page]]'))
    it('creates a wikilink with alias', () => {
      expect(formattingFilters.wikilink('Page', 'Alias')).toBe('[[Page|Alias]]')
    })
    it('creates multiple wikilinks from array', () => {
      expect(formattingFilters.wikilink(['A', 'B'])).toBe('[[A]]\n[[B]]')
    })
  })

  describe('yaml', () => {
    it('serializes object to YAML', () => {
      const result = String(formattingFilters.yaml({ name: 'Ada' }))
      expect(result).toContain('name: Ada')
    })
    it('returns empty string for null', () => expect(formattingFilters.yaml(null)).toBe(''))
  })

  describe('yaml_property', () => {
    it('creates a YAML key-value line for a scalar', () => {
      const result = String(formattingFilters.yaml_property('Ada', 'name'))
      expect(result).toBe('name: Ada')
    })
    it('falls back to full YAML when key is null', () => {
      const result = String(formattingFilters.yaml_property({ a: 1 }, null))
      expect(result).toContain('a:')
    })
  })
})

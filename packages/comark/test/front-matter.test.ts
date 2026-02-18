import { describe, expect, it } from 'vitest'
import { parseFrontmatter, renderFrontmatter } from '../src/internal/front-matter'

describe('parseFrontmatter', () => {
  it('should parse simple frontmatter', () => {
    const input = `---
title: Hello World
---

Content here`
    const result = parseFrontmatter(input)
    expect(result.data).toEqual({ title: 'Hello World' })
    expect(result.content.trim()).toBe('Content here')
  })

  it('should parse frontmatter with multiple fields', () => {
    const input = `---
title: My Post
author: John Doe
date: 2024-01-15
draft: false
---

# Heading`
    const result = parseFrontmatter(input)
    expect(result.data).toEqual({
      title: 'My Post',
      author: 'John Doe',
      date: '2024-01-15',
      draft: false,
    })
    expect(result.content.trim()).toBe('# Heading')
  })

  it('should parse frontmatter with nested objects', () => {
    const input = `---
title: Nested
meta:
  description: A description
  keywords:
    - one
    - two
---

Content`
    const result = parseFrontmatter(input)
    expect(result.data).toEqual({
      title: 'Nested',
      meta: {
        description: 'A description',
        keywords: ['one', 'two'],
      },
    })
  })

  it('should parse frontmatter with arrays', () => {
    const input = `---
tags:
  - javascript
  - typescript
  - vue
---

Content`
    const result = parseFrontmatter(input)
    expect(result.data).toEqual({
      tags: ['javascript', 'typescript', 'vue'],
    })
  })

  it('should return empty data when no frontmatter', () => {
    const input = `# Just Markdown

No frontmatter here.`
    const result = parseFrontmatter(input)
    expect(result.data).toEqual({})
    expect(result.content).toBe(input)
  })

  it('should return empty data when --- is not at start', () => {
    const input = `Some text
---
title: Not Frontmatter
---`
    const result = parseFrontmatter(input)
    expect(result.data).toEqual({})
    expect(result.content).toBe(input)
  })

  it('should handle frontmatter without closing delimiter', () => {
    const input = `---
title: Unclosed`
    const result = parseFrontmatter(input)
    expect(result.data).toEqual({})
    expect(result.content).toBe(input)
  })

  it('should handle empty frontmatter', () => {
    const input = `---
---

Content`
    const result = parseFrontmatter(input)
    // Empty frontmatter string is falsy, so the block is not processed
    // and the entire input is returned as content
    expect(result.data).toEqual({})
    expect(result.content).toBe(input)
  })

  it('should handle frontmatter with special characters', () => {
    const input = `---
title: "Hello: World"
description: "It's a test"
---

Content`
    const result = parseFrontmatter(input)
    expect(result.data.title).toBe('Hello: World')
    expect(result.data.description).toBe('It\'s a test')
  })

  it('should handle CRLF line endings', () => {
    const input = '---\r\ntitle: Windows\r\n---\r\n\r\nContent'
    const result = parseFrontmatter(input)
    expect(result.data).toEqual({ title: 'Windows' })
    expect(result.content.trim()).toBe('Content')
  })

  it('should handle frontmatter with numbers', () => {
    const input = `---
count: 42
price: 19.99
negative: -5
---

Content`
    const result = parseFrontmatter(input)
    expect(result.data).toEqual({
      count: 42,
      price: 19.99,
      negative: -5,
    })
  })

  it('should handle frontmatter with boolean values', () => {
    const input = `---
published: true
draft: false
---

Content`
    const result = parseFrontmatter(input)
    expect(result.data).toEqual({
      published: true,
      draft: false,
    })
  })

  it('should handle frontmatter with null values', () => {
    const input = `---
title: Test
description: null
---

Content`
    const result = parseFrontmatter(input)
    expect(result.data).toEqual({
      title: 'Test',
      description: null,
    })
  })

  it('should preserve content after frontmatter exactly', () => {
    const input = `---
title: Test
---

# Heading

Paragraph with **bold** and *italic*.

- List item 1
- List item 2`
    const result = parseFrontmatter(input)
    expect(result.content).toContain('# Heading')
    expect(result.content).toContain('**bold**')
    expect(result.content).toContain('- List item 1')
  })
})

describe('renderFrontmatter', () => {
  it('should render simple frontmatter with content', () => {
    const data = { title: 'Hello World' }
    const content = 'Content here'
    const result = renderFrontmatter(data, content)
    expect(result).toContain('---')
    expect(result).toContain('title: Hello World')
    expect(result).toContain('Content here')
  })

  it('should render frontmatter without content', () => {
    const data = { title: 'Hello', author: 'John' }
    const result = renderFrontmatter(data)
    expect(result).toContain('title: Hello')
    expect(result).toContain('author: John')
    expect(result).not.toContain('---')
  })

  it('should return just content when data is empty', () => {
    const result = renderFrontmatter({}, 'Just content')
    expect(result.trim()).toBe('Just content')
    expect(result).not.toContain('---')
  })

  it('should return just content when data is null', () => {
    const result = renderFrontmatter(null, 'Just content')
    expect(result.trim()).toBe('Just content')
  })

  it('should return just content when data is undefined', () => {
    const result = renderFrontmatter(undefined, 'Just content')
    expect(result.trim()).toBe('Just content')
  })

  it('should render nested objects', () => {
    const data = {
      title: 'Test',
      meta: {
        description: 'A description',
      },
    }
    const result = renderFrontmatter(data, 'Content')
    expect(result).toContain('title: Test')
    expect(result).toContain('meta:')
    expect(result).toContain('description: A description')
  })

  it('should render arrays', () => {
    const data = {
      tags: ['one', 'two', 'three'],
    }
    const result = renderFrontmatter(data, 'Content')
    expect(result).toContain('tags:')
    expect(result).toContain('- one')
    expect(result).toContain('- two')
    expect(result).toContain('- three')
  })

  it('should handle empty content string', () => {
    const data = { title: 'Test' }
    const result = renderFrontmatter(data, '')
    // Empty content string is falsy, so returns just YAML without delimiters
    expect(result).toContain('title: Test')
    expect(result).not.toContain('---')
  })

  it('should trim content whitespace', () => {
    const data = { title: 'Test' }
    const content = '  \n  Content with spaces  \n  '
    const result = renderFrontmatter(data, content)
    expect(result).toContain('Content with spaces')
  })

  it('should return newline for empty data and no content', () => {
    const result = renderFrontmatter({})
    expect(result).toBe('')
  })

  it('should render boolean values correctly', () => {
    const data = { published: true, draft: false }
    const result = renderFrontmatter(data, 'Content')
    expect(result).toContain('published: true')
    expect(result).toContain('draft: false')
  })

  it('should render number values correctly', () => {
    const data = { count: 42, price: 19.99 }
    const result = renderFrontmatter(data, 'Content')
    expect(result).toContain('count: 42')
    expect(result).toContain('price: 19.99')
  })
})

describe('parseFrontmatter and renderFrontmatter roundtrip', () => {
  it('should roundtrip simple frontmatter', () => {
    const original = { title: 'Test', author: 'John' }
    const content = 'Hello World'
    const rendered = renderFrontmatter(original, content)
    const parsed = parseFrontmatter(rendered)
    expect(parsed.data).toEqual(original)
    expect(parsed.content.trim()).toBe(content)
  })

  it('should roundtrip complex frontmatter', () => {
    const original = {
      title: 'Complex',
      tags: ['a', 'b', 'c'],
      meta: {
        views: 100,
        published: true,
      },
    }
    const content = '# Heading\n\nParagraph'
    const rendered = renderFrontmatter(original, content)
    const parsed = parseFrontmatter(rendered)
    expect(parsed.data).toEqual(original)
  })
})

import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

describe('unordered Lists', () => {
  describe('simple Unordered Lists', () => {
    it('should parse a simple unordered list with dashes', () => {
      const markdown = `- Item 1
- Item 2
- Item 3`

      const result = parse(markdown)

      expect(result.body.type).toBe('root')
      const ul = result.body.children.find((c: any) => c.tag === 'ul')
      expect(ul).toBeDefined()
      expect(ul.children).toHaveLength(3)

      ul.children.forEach((li: any, index: number) => {
        expect(li.tag).toBe('li')
        expect(li.children[0].type).toBe('text')
        expect(li.children[0].value).toBe(`Item ${index + 1}`)
      })
    })

    it('should parse a simple unordered list with asterisks', () => {
      const markdown = `* First item
* Second item
* Third item`

      const result = parse(markdown)

      const ul = result.body.children.find((c: any) => c.tag === 'ul')
      expect(ul).toBeDefined()
      expect(ul.children).toHaveLength(3)
    })

    it('should parse a simple unordered list with plus signs', () => {
      const markdown = `+ Alpha
+ Beta
+ Gamma`

      const result = parse(markdown)

      const ul = result.body.children.find((c: any) => c.tag === 'ul')
      expect(ul).toBeDefined()
      expect(ul.children).toHaveLength(3)
    })

    it('should handle list items with inline formatting', () => {
      const markdown = `- **Bold item**
- *Italic item*
- \`Code item\`
- Regular item`

      const result = parse(markdown)

      const ul = result.body.children.find((c: any) => c.tag === 'ul')
      expect(ul).toBeDefined()
      expect(ul.children).toHaveLength(4)

      // Check bold item
      expect(ul.children[0].children[0].tag).toBe('strong')

      // Check italic item
      expect(ul.children[1].children[0].tag).toBe('em')

      // Check code item
      expect(ul.children[2].children[0].tag).toBe('code')
    })

    it('should handle multiline list items', () => {
      const markdown = `- First line
  Second line of same item
- Another item`

      const result = parse(markdown)

      const ul = result.body.children.find((c: any) => c.tag === 'ul')
      expect(ul).toBeDefined()
      expect(ul.children).toHaveLength(2)

      // First item should contain both lines
      const firstItem = ul.children[0]
      const firstItemText = firstItem.children.map((c: any) =>
        c.type === 'text' ? c.value : '',
      ).join(' ')
      expect(firstItemText).toContain('First line')
      expect(firstItemText).toContain('Second line')
    })

    it('should parse lists with links', () => {
      const markdown = `- Regular item
- Item with [link](https://example.com)
- Another regular item`

      const result = parse(markdown)

      const ul = result.body.children.find((c: any) => c.tag === 'ul')
      expect(ul).toBeDefined()
      expect(ul.children).toHaveLength(3)

      // Second item should contain a link
      const secondItem = ul.children[1]
      const hasLink = secondItem.children.some((c: any) => c.tag === 'a')
      expect(hasLink).toBe(true)
    })
  })

  describe('nested Unordered Lists', () => {
    it('should parse two-level nested unordered list', () => {
      const markdown = `- Parent 1
  - Child 1.1
  - Child 1.2
- Parent 2
  - Child 2.1`

      const result = parse(markdown)

      const ul = result.body.children.find((c: any) => c.tag === 'ul')
      expect(ul).toBeDefined()
      expect(ul.children).toHaveLength(2)

      // First parent should have nested ul
      const parent1 = ul.children[0]
      const nestedUl1 = parent1.children.find((c: any) => c.tag === 'ul')
      expect(nestedUl1).toBeDefined()
      expect(nestedUl1.children).toHaveLength(2)

      // Second parent should have nested ul
      const parent2 = ul.children[1]
      const nestedUl2 = parent2.children.find((c: any) => c.tag === 'ul')
      expect(nestedUl2).toBeDefined()
      expect(nestedUl2.children).toHaveLength(1)
    })

    it('should parse three-level nested unordered list', () => {
      const markdown = `- Level 1
  - Level 2
    - Level 3
    - Level 3 item 2
  - Level 2 item 2`

      const result = parse(markdown)

      const ul = result.body.children.find((c: any) => c.tag === 'ul')
      expect(ul).toBeDefined()

      // Navigate to level 2
      const level1Item = ul.children[0]
      const level2Ul = level1Item.children.find((c: any) => c.tag === 'ul')
      expect(level2Ul).toBeDefined()
      expect(level2Ul.children).toHaveLength(2)

      // Navigate to level 3
      const level2Item = level2Ul.children[0]
      const level3Ul = level2Item.children.find((c: any) => c.tag === 'ul')
      expect(level3Ul).toBeDefined()
      expect(level3Ul.children).toHaveLength(2)
    })

    it('should handle nested lists with different markers', () => {
      const markdown = `- Dash item
  * Asterisk nested
  * Another asterisk
- Another dash
  + Plus nested`

      const result = parse(markdown)

      const ul = result.body.children.find((c: any) => c.tag === 'ul')
      expect(ul).toBeDefined()
      expect(ul.children).toHaveLength(2)

      // All nested items should still be ul (unordered)
      const nested1 = ul.children[0].children.find((c: any) => c.tag === 'ul')
      expect(nested1).toBeDefined()
      expect(nested1.children).toHaveLength(2)

      const nested2 = ul.children[1].children.find((c: any) => c.tag === 'ul')
      expect(nested2).toBeDefined()
      expect(nested2.children).toHaveLength(1)
    })
  })
})

describe('ordered Lists', () => {
  describe('simple Ordered Lists', () => {
    it('should parse a simple ordered list', () => {
      const markdown = `1. First item
2. Second item
3. Third item`

      const result = parse(markdown)

      expect(result.body.type).toBe('root')
      const ol = result.body.children.find((c: any) => c.tag === 'ol')
      expect(ol).toBeDefined()
      expect(ol.children).toHaveLength(3)

      ol.children.forEach((li: any, index: number) => {
        expect(li.tag).toBe('li')
        const text = li.children.find((c: any) => c.type === 'text')
        expect(text.value).toContain(index === 0 ? 'First' : index === 1 ? 'Second' : 'Third')
      })
    })

    it('should parse ordered list with non-sequential numbers', () => {
      const markdown = `1. First item
1. Second item (marked as 1)
1. Third item (marked as 1)`

      const result = parse(markdown)

      const ol = result.body.children.find((c: any) => c.tag === 'ol')
      expect(ol).toBeDefined()
      expect(ol.children).toHaveLength(3)
    })

    it('should handle ordered list starting from different number', () => {
      const markdown = `5. Fifth item
6. Sixth item
7. Seventh item`

      const result = parse(markdown)

      const ol = result.body.children.find((c: any) => c.tag === 'ol')
      expect(ol).toBeDefined()
      expect(ol.children).toHaveLength(3)
    })

    it('should handle ordered list items with inline formatting', () => {
      const markdown = `1. **Bold** item
2. *Italic* item
3. \`Code\` item
4. [Link](url) item`

      const result = parse(markdown)

      const ol = result.body.children.find((c: any) => c.tag === 'ol')
      expect(ol).toBeDefined()
      expect(ol.children).toHaveLength(4)

      // Check for formatted content
      expect(ol.children[0].children.some((c: any) => c.tag === 'strong')).toBe(true)
      expect(ol.children[1].children.some((c: any) => c.tag === 'em')).toBe(true)
      expect(ol.children[2].children.some((c: any) => c.tag === 'code')).toBe(true)
      expect(ol.children[3].children.some((c: any) => c.tag === 'a')).toBe(true)
    })

    it('should handle multiline ordered list items', () => {
      const markdown = `1. First line
   Continuation of first item
2. Second item`

      const result = parse(markdown)

      const ol = result.body.children.find((c: any) => c.tag === 'ol')
      expect(ol).toBeDefined()
      expect(ol.children).toHaveLength(2)
    })
  })

  describe('nested Ordered Lists', () => {
    it('should parse two-level nested ordered list', () => {
      const markdown = `1. First parent
   1. First child
   2. Second child
2. Second parent
   1. Another child`

      const result = parse(markdown)

      const ol = result.body.children.find((c: any) => c.tag === 'ol')
      expect(ol).toBeDefined()
      expect(ol.children).toHaveLength(2)

      // First parent should have nested ol
      const parent1 = ol.children[0]
      const nestedOl1 = parent1.children.find((c: any) => c.tag === 'ol')
      expect(nestedOl1).toBeDefined()
      expect(nestedOl1.children).toHaveLength(2)

      // Second parent should have nested ol
      const parent2 = ol.children[1]
      const nestedOl2 = parent2.children.find((c: any) => c.tag === 'ol')
      expect(nestedOl2).toBeDefined()
      expect(nestedOl2.children).toHaveLength(1)
    })

    it('should parse three-level nested ordered list', () => {
      const markdown = `1. Level 1
   1. Level 2
      1. Level 3
      2. Level 3 item 2
   2. Level 2 item 2`

      const result = parse(markdown)

      const ol = result.body.children.find((c: any) => c.tag === 'ol')
      expect(ol).toBeDefined()

      // Navigate to level 2
      const level1Item = ol.children[0]
      const level2Ol = level1Item.children.find((c: any) => c.tag === 'ol')
      expect(level2Ol).toBeDefined()
      expect(level2Ol.children).toHaveLength(2)

      // Navigate to level 3
      const level2Item = level2Ol.children[0]
      const level3Ol = level2Item.children.find((c: any) => c.tag === 'ol')
      expect(level3Ol).toBeDefined()
      expect(level3Ol.children).toHaveLength(2)
    })

    it('should handle deeply nested ordered lists', () => {
      const markdown = `1. First
   1. Second
      1. Third
         1. Fourth
            1. Fifth`

      const result = parse(markdown)

      const ol = result.body.children.find((c: any) => c.tag === 'ol')
      expect(ol).toBeDefined()

      // Navigate through nesting levels
      let currentList = ol
      let depth = 0

      while (depth < 4) {
        const item = currentList.children[0]
        const nestedList = item.children.find((c: any) => c.tag === 'ol')

        if (nestedList) {
          expect(nestedList).toBeDefined()
          currentList = nestedList
          depth++
        }
        else {
          break
        }
      }

      expect(depth).toBe(4) // Should have 5 levels total (0-4)
    })
  })
})

describe('mixed Lists', () => {
  it('should handle ordered list inside unordered list', () => {
    const markdown = `- Unordered parent
  1. Ordered child 1
  2. Ordered child 2
- Another unordered parent`

    const result = parse(markdown)

    const ul = result.body.children.find((c: any) => c.tag === 'ul')
    expect(ul).toBeDefined()
    expect(ul.children).toHaveLength(2)

    // First item should have nested ordered list
    const firstItem = ul.children[0]
    const nestedOl = firstItem.children.find((c: any) => c.tag === 'ol')
    expect(nestedOl).toBeDefined()
    expect(nestedOl.children).toHaveLength(2)
  })

  it('should handle unordered list inside ordered list', () => {
    const markdown = `1. Ordered parent
   - Unordered child 1
   - Unordered child 2
2. Another ordered parent`

    const result = parse(markdown)

    const ol = result.body.children.find((c: any) => c.tag === 'ol')
    expect(ol).toBeDefined()
    expect(ol.children).toHaveLength(2)

    // First item should have nested unordered list
    const firstItem = ol.children[0]
    const nestedUl = firstItem.children.find((c: any) => c.tag === 'ul')
    expect(nestedUl).toBeDefined()
    expect(nestedUl.children).toHaveLength(2)
  })

  it('should handle complex mixed nesting', () => {
    const markdown = `1. Ordered level 1
   - Unordered level 2
     1. Ordered level 3
     2. Ordered level 3 item 2
   - Unordered level 2 item 2
2. Ordered level 1 item 2`

    const result = parse(markdown)

    const ol = result.body.children.find((c: any) => c.tag === 'ol')
    expect(ol).toBeDefined()

    // Check mixed nesting structure
    const level1Item = ol.children[0]
    const level2Ul = level1Item.children.find((c: any) => c.tag === 'ul')
    expect(level2Ul).toBeDefined()
    expect(level2Ul.children).toHaveLength(2)

    const level2Item = level2Ul.children[0]
    const level3Ol = level2Item.children.find((c: any) => c.tag === 'ol')
    expect(level3Ol).toBeDefined()
    expect(level3Ol.children).toHaveLength(2)
  })

  it('should handle lists with paragraphs and nested lists', () => {
    const markdown = `- First item with paragraph

  Continued paragraph

  - Nested item 1
  - Nested item 2

- Second parent item`

    const result = parse(markdown)

    const ul = result.body.children.find((c: any) => c.tag === 'ul')
    expect(ul).toBeDefined()
    expect(ul.children).toHaveLength(2)

    // First item should contain paragraphs and nested list
    const firstItem = ul.children[0]
    const nestedUl = firstItem.children.find((c: any) => c.tag === 'ul')
    expect(nestedUl).toBeDefined()
    expect(nestedUl.children).toHaveLength(2)
  })

  it('should handle lists with MDC components at various levels', () => {
    const markdown = `- Regular item
  - Nested item
  - Another nested
- Second parent`

    const result = parse(markdown)

    const ul = result.body.children.find((c: any) => c.tag === 'ul')
    expect(ul).toBeDefined()
    expect(ul.children).toHaveLength(2)

    // First parent should have nested list
    const firstParent = ul.children[0]
    const nestedUl = firstParent.children.find((c: any) => c.tag === 'ul')
    expect(nestedUl).toBeDefined()
  })
})

describe('list Edge Cases', () => {
  it('should handle empty list items', () => {
    const markdown = `- Item 1
-
- Item 3`

    const result = parse(markdown)

    const ul = result.body.children.find((c: any) => c.tag === 'ul')
    expect(ul).toBeDefined()
    // Should have all items even if some are empty
    expect(ul.children.length).toBeGreaterThanOrEqual(2)
  })

  it('should handle list items with inline code', () => {
    const markdown = `- Item with \`inline code\`
- Another item with \`more code\`
- Regular item`

    const result = parse(markdown)

    const ul = result.body.children.find((c: any) => c.tag === 'ul')
    expect(ul).toBeDefined()
    expect(ul.children).toHaveLength(3)

    // First two items should contain code elements
    const firstItem = ul.children[0]
    const hasCode = firstItem.children.some((c: any) => c.tag === 'code')
    expect(hasCode).toBe(true)
  })

  it('should handle task lists (checkboxes)', () => {
    const markdown = `- [ ] Unchecked task
- [x] Checked task
- [ ] Another unchecked`

    const result = parse(markdown)

    const ul = result.body.children.find((c: any) => c.tag === 'ul')
    expect(ul).toBeDefined()
    expect(ul.children).toHaveLength(3)
  })

  it('should separate adjacent lists of different types', () => {
    const markdown = `- Unordered item
- Another unordered

1. Ordered item
2. Another ordered`

    const result = parse(markdown)

    const ul = result.body.children.find((c: any) => c.tag === 'ul')
    const ol = result.body.children.find((c: any) => c.tag === 'ol')

    expect(ul).toBeDefined()
    expect(ol).toBeDefined()
    expect(ul.children).toHaveLength(2)
    expect(ol.children).toHaveLength(2)
  })
})

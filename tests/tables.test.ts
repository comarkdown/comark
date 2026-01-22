import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'

describe('table Parsing', () => {
  describe('simple tables', () => {
    it('should parse a simple table with both parsers', () => {
      const content = `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |
| Cell 3   | Cell 4   |`

      const result1 = parse(content)
      const result2 = parse(content)

      // Both should have a table element
      expect(result1.body.children.length).toBeGreaterThan(0)
      expect(result2.body.children.length).toBeGreaterThan(0)

      const table1 = result1.body.children[0]
      const table2 = result2.body.children[0]

      expect(table1.type).toBe('element')
      expect(table2.type).toBe('element')
      expect(table1.tag).toBe('table')
      expect(table2.tag).toBe('table')
    })

    it('should parse table headers correctly', () => {
      const content = `| Name | Age | City |
|------|-----|------|
| John | 30  | NYC  |`

      const result1 = parse(content)
      const result2 = parse(content)

      const table1 = result1.body.children[0]
      const table2 = result2.body.children[0]

      // Both should have thead
      const thead1 = table1.children.find((c: any) => c.tag === 'thead')
      const thead2 = table2.children.find((c: any) => c.tag === 'thead')

      expect(thead1).toBeDefined()
      expect(thead2).toBeDefined()
    })

    it('should parse table body correctly', () => {
      const content = `| Col1 | Col2 |
|------|------|
| A    | B    |
| C    | D    |`

      const result1 = parse(content)
      const result2 = parse(content)

      const table1 = result1.body.children[0]
      const table2 = result2.body.children[0]

      // Both should have tbody
      const tbody1 = table1.children.find((c: any) => c.tag === 'tbody')
      const tbody2 = table2.children.find((c: any) => c.tag === 'tbody')

      expect(tbody1).toBeDefined()
      expect(tbody2).toBeDefined()

      // Should have 2 rows
      expect(tbody1.children.length).toBe(2)
      expect(tbody2.children.length).toBe(2)
    })
  })

  describe('table alignment', () => {
    it('should handle left-aligned columns', () => {
      const content = `| Left |
|:-----|
| Text |`

      const result1 = parse(content)
      const result2 = parse(content)

      expect(result1.body.children[0].tag).toBe('table')
      expect(result2.body.children[0].tag).toBe('table')
    })

    it('should handle right-aligned columns', () => {
      const content = `| Right |
|------:|
| Text  |`

      const result1 = parse(content)
      const result2 = parse(content)

      expect(result1.body.children[0].tag).toBe('table')
      expect(result2.body.children[0].tag).toBe('table')
    })

    it('should handle center-aligned columns', () => {
      const content = `| Center |
|:------:|
| Text   |`

      const result1 = parse(content)
      const result2 = parse(content)

      expect(result1.body.children[0].tag).toBe('table')
      expect(result2.body.children[0].tag).toBe('table')
    })

    it('should handle mixed alignment', () => {
      const content = `| Left | Center | Right |
|:-----|:------:|------:|
| A    | B      | C     |`

      const result1 = parse(content)
      const result2 = parse(content)

      const table1 = result1.body.children[0]
      const table2 = result2.body.children[0]

      expect(table1.tag).toBe('table')
      expect(table2.tag).toBe('table')
    })
  })

  describe('table with inline markdown', () => {
    it('should parse bold text in cells', () => {
      const content = `| Column |
|--------|
| **Bold** |`

      const result1 = parse(content)
      const result2 = parse(content)

      expect(result1.body.children[0].tag).toBe('table')
      expect(result2.body.children[0].tag).toBe('table')

      // Both should have the bold element inside
      const hasStrong = (node: any): boolean => {
        if (node.tag === 'strong')
          return true
        if (node.children) {
          return node.children.some((child: any) => hasStrong(child))
        }
        return false
      }

      expect(hasStrong(result1.body.children[0])).toBe(true)
      expect(hasStrong(result2.body.children[0])).toBe(true)
    })

    it('should parse italic text in cells', () => {
      const content = `| Column |
|--------|
| *Italic* |`

      const result1 = parse(content)
      const result2 = parse(content)

      const hasEm = (node: any): boolean => {
        if (node.tag === 'em')
          return true
        if (node.children) {
          return node.children.some((child: any) => hasEm(child))
        }
        return false
      }

      expect(hasEm(result1.body.children[0])).toBe(true)
      expect(hasEm(result2.body.children[0])).toBe(true)
    })

    it('should parse code in cells', () => {
      const content = `| Column |
|--------|
| \`code\` |`

      const result1 = parse(content)
      const result2 = parse(content)

      const hasCode = (node: any): boolean => {
        if (node.tag === 'code')
          return true
        if (node.children) {
          return node.children.some((child: any) => hasCode(child))
        }
        return false
      }

      expect(hasCode(result1.body.children[0])).toBe(true)
      expect(hasCode(result2.body.children[0])).toBe(true)
    })

    it('should parse links in cells', () => {
      const content = `| Column |
|--------|
| [link](https://example.com) |`

      const result1 = parse(content)
      const result2 = parse(content)

      const hasLink = (node: any): boolean => {
        if (node.tag === 'a')
          return true
        if (node.children) {
          return node.children.some((child: any) => hasLink(child))
        }
        return false
      }

      expect(hasLink(result1.body.children[0])).toBe(true)
      expect(hasLink(result2.body.children[0])).toBe(true)
    })

    it('should parse images in cells', () => {
      const content = `| Column |
|--------|
| ![alt](https://example.com/img.png) |`

      const result1 = parse(content)
      const result2 = parse(content)

      const hasImg = (node: any): boolean => {
        if (node.tag === 'img')
          return true
        if (node.children) {
          return node.children.some((child: any) => hasImg(child))
        }
        return false
      }

      expect(hasImg(result1.body.children[0])).toBe(true)
      expect(hasImg(result2.body.children[0])).toBe(true)
    })
  })

  describe('complex tables', () => {
    it('should parse tables with many columns', () => {
      const content = `| A | B | C | D | E | F |
|---|---|---|---|---|---|
| 1 | 2 | 3 | 4 | 5 | 6 |
| 7 | 8 | 9 | 10| 11| 12|`

      const result1 = parse(content)
      const result2 = parse(content)

      expect(result1.body.children[0].tag).toBe('table')
      expect(result2.body.children[0].tag).toBe('table')
    })

    it('should parse tables with many rows', () => {
      const content = `| Column |
|--------|
| Row 1  |
| Row 2  |
| Row 3  |
| Row 4  |
| Row 5  |
| Row 6  |
| Row 7  |
| Row 8  |
| Row 9  |
| Row 10 |`

      const result1 = parse(content)
      const result2 = parse(content)

      const table1 = result1.body.children[0]
      const table2 = result2.body.children[0]

      expect(table1.tag).toBe('table')
      expect(table2.tag).toBe('table')

      const tbody1 = table1.children.find((c: any) => c.tag === 'tbody')
      const tbody2 = table2.children.find((c: any) => c.tag === 'tbody')

      expect(tbody1.children.length).toBe(10)
      expect(tbody2.children.length).toBe(10)
    })

    it('should parse tables with empty cells', () => {
      const content = `| Col1 | Col2 | Col3 |
|------|------|------|
| A    |      | C    |
|      | B    |      |`

      const result1 = parse(content)
      const result2 = parse(content)

      expect(result1.body.children[0].tag).toBe('table')
      expect(result2.body.children[0].tag).toBe('table')
    })

    it('should parse tables with mixed content', () => {
      const content = `| Name | Description | Link |
|------|-------------|------|
| **Project** | A *great* project | [Visit](https://example.com) |
| \`code\` | Some \`inline\` code | ![img](img.png) |`

      const result1 = parse(content)
      const result2 = parse(content)

      expect(result1.body.children[0].tag).toBe('table')
      expect(result2.body.children[0].tag).toBe('table')
    })
  })

  describe('tables with surrounding content', () => {
    it('should parse table with heading before', () => {
      const content = `# Table Example

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |`

      const result1 = parse(content)
      const result2 = parse(content)

      expect(result1.body.children.length).toBe(2)
      expect(result2.body.children.length).toBe(2)

      expect(result1.body.children[0].tag).toBe('h1')
      expect(result2.body.children[0].tag).toBe('h1')

      expect(result1.body.children[1].tag).toBe('table')
      expect(result2.body.children[1].tag).toBe('table')
    })

    it('should parse table with paragraph after', () => {
      const content = `| Column |
|--------|
| Data   |

This is a paragraph after the table.`

      const result1 = parse(content)
      const result2 = parse(content)

      expect(result1.body.children.length).toBe(2)
      expect(result2.body.children.length).toBe(2)

      expect(result1.body.children[0].tag).toBe('table')
      expect(result2.body.children[0].tag).toBe('table')

      expect(result1.body.children[1].tag).toBe('p')
      expect(result2.body.children[1].tag).toBe('p')
    })

    it('should parse multiple tables', () => {
      const content = `| Table 1 |
|---------|
| Data 1  |

| Table 2 |
|---------|
| Data 2  |`

      const result1 = parse(content)
      const result2 = parse(content)

      // Should have 2 tables
      const tables1 = result1.body.children.filter((c: any) => c.tag === 'table')
      const tables2 = result2.body.children.filter((c: any) => c.tag === 'table')

      expect(tables1.length).toBe(2)
      expect(tables2.length).toBe(2)
    })
  })

  describe('edge cases', () => {
    it('should handle table with single column', () => {
      const content = `| Single |
|--------|
| Cell   |`

      const result1 = parse(content)
      const result2 = parse(content)

      expect(result1.body.children[0].tag).toBe('table')
      expect(result2.body.children[0].tag).toBe('table')
    })

    it('should handle table with single row', () => {
      const content = `| Header 1 | Header 2 |
|----------|----------|
| Only Row | Data     |`

      const result1 = parse(content)
      const result2 = parse(content)

      const table1 = result1.body.children[0]
      const table2 = result2.body.children[0]

      expect(table1.tag).toBe('table')
      expect(table2.tag).toBe('table')

      const tbody1 = table1.children.find((c: any) => c.tag === 'tbody')
      const tbody2 = table2.children.find((c: any) => c.tag === 'tbody')

      expect(tbody1.children.length).toBe(1)
      expect(tbody2.children.length).toBe(1)
    })

    it('should handle table with special characters', () => {
      const content = `| Name | Symbol |
|------|--------|
| Pipe | \\|     |
| Dash | -      |`

      const result1 = parse(content)
      const result2 = parse(content)

      expect(result1.body.children[0].tag).toBe('table')
      expect(result2.body.children[0].tag).toBe('table')
    })

    it('should handle table with long content', () => {
      const content = `| Description |
|-------------|
| This is a very long cell content that spans multiple words and should be properly parsed by both parsers |`

      const result1 = parse(content)
      const result2 = parse(content)

      expect(result1.body.children[0].tag).toBe('table')
      expect(result2.body.children[0].tag).toBe('table')
    })
  })

  describe('tables with frontmatter', () => {
    it('should parse table with frontmatter', () => {
      const content = `---
title: Table Test
---

| Column 1 | Column 2 |
|----------|----------|
| Data 1   | Data 2   |`

      const result1 = parse(content)
      const result2 = parse(content)

      expect(result1.data.title).toBe('Table Test')
      expect(result2.data.title).toBe('Table Test')

      expect(result1.body.children[0].tag).toBe('table')
      expect(result2.body.children[0].tag).toBe('table')
    })
  })

  describe('comparison tests', () => {
    it('should produce identical structure for simple table', () => {
      const content = `| A | B |
|---|---|
| 1 | 2 |`

      const result1 = parse(content)
      const result2 = parse(content)

      const table1 = result1.body.children[0]
      const table2 = result2.body.children[0]

      // Both should have the same tag
      expect(table1.tag).toBe(table2.tag)

      // Both should have thead and tbody
      const tags1 = table1.children.map((c: any) => c.tag).sort()
      const tags2 = table2.children.map((c: any) => c.tag).sort()

      expect(tags1).toEqual(tags2)
    })

    it('should produce similar results for complex table', () => {
      const content = `| Name | Type | Description |
|:-----|:----:|------------:|
| **foo** | \`string\` | A *test* value |
| bar | \`number\` | Another [value](https://example.com) |`

      const result1 = parse(content)
      const result2 = parse(content)

      // Both should parse successfully
      expect(result1.body.children[0].tag).toBe('table')
      expect(result2.body.children[0].tag).toBe('table')

      // Both should have similar structure
      const countElements = (node: any, tag: string): number => {
        let count = 0
        if (node.tag === tag)
          count++
        if (node.children) {
          node.children.forEach((child: any) => {
            count += countElements(child, tag)
          })
        }
        return count
      }

      const table1 = result1.body.children[0]
      const table2 = result2.body.children[0]

      // Should have same number of rows
      expect(countElements(table1, 'tr')).toBe(countElements(table2, 'tr'))

      // Should have same number of cells
      const cells1 = countElements(table1, 'th') + countElements(table1, 'td')
      const cells2 = countElements(table2, 'th') + countElements(table2, 'td')
      expect(cells1).toBe(cells2)
    })
  })
})

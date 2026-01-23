import type { MDCNode, MDCRoot } from '../src/types/tree'
import { describe, expect, it } from 'vitest'
import { parse } from '../src/index'
import { parseWithRemark } from './utils'

interface ParseResult {
  body: MDCRoot
  excerpt?: MDCRoot
  data: any
  toc?: any
}

// Helper function to normalize structure for comparison
function normalizeStructure(node: MDCNode | MDCRoot): any {
  if (node.type === 'root') {
    return {
      type: 'root',
      children: node.children.map(normalizeStructure),
    }
  }
  if (node.type === 'text') {
    return {
      type: 'text',
      value: node.value.trim(),
    }
  }
  if (node.type === 'element') {
    // Sort props keys for consistent comparison
    const normalizedProps = node.props
      ? Object.keys(node.props).sort().reduce((acc, key) => {
          acc[key] = node.props![key]
          return acc
        }, {} as Record<string, any>)
      : undefined

    return {
      type: 'element',
      tag: node.tag,
      props: normalizedProps,
      children: node.children.map(normalizeStructure),
    }
  }
  return node
}

// Deep comparison function for MDC nodes
function deepCompareNodes(
  node1: any,
  node2: any,
  path: string = 'root',
  testCase: string,
): void {
  // Compare types
  expect(node1.type, `${testCase}: ${path} - type should match`).toBe(node2.type)

  if (node1.type === 'root' || node1.type === 'element') {
    // Compare children count
    expect(
      node1.children.length,
      `${testCase}: ${path} - children count should match (got ${node1.children.length} vs ${node2.children.length})`,
    ).toBe(node2.children.length)

    // Recursively compare each child
    for (let i = 0; i < node1.children.length; i++) {
      const childPath = node1.type === 'root' ? `children[${i}]` : `${path}.children[${i}]`
      deepCompareNodes(node1.children[i], node2.children[i], childPath, testCase)
    }

    // For elements, compare tag and props
    if (node1.type === 'element') {
      expect(
        node1.tag,
        `${testCase}: ${path} - tag should match`,
      ).toBe(node2.tag)

      // Compare props
      const props1 = node1.props || {}
      const props2 = node2.props || {}

      // Normalize props by removing ':' prefix (markdown-it-mdc uses :boolean, unified uses boolean)
      // Also filter out attributes that start with ':' if unified parser doesn't include them
      // Also ignore 'align' and 'style' props as parsers handle table alignment differently
      // TODO: This normalization can be removed later when both parsers produce consistent prop names
      const normalizeProps = (props: Record<string, any>, isUnified: boolean) => {
        const normalized: Record<string, any> = {}
        for (const [key, value] of Object.entries(props)) {
          // Skip 'align' and 'style' props as they differ between parsers for table alignment
          if (key === 'align' || key === 'style')
            continue

          // If this is from unified parser, keep as is
          // If this is from markdown-it, remove ':' prefix and filter out if unified doesn't have it
          if (isUnified) {
            normalized[key] = value
          }
          else {
            // For markdown-it, remove ':' prefix
            const normalizedKey = key.startsWith(':') ? key.slice(1) : key
            // Only include if unified parser would have it (check if it exists in unified props)
            // For now, we'll include all normalized keys and let the comparison handle missing ones
            normalized[normalizedKey] = value
          }
        }
        return normalized
      }

      // Determine which is unified and which is markdown-it by checking for ':' prefix
      const hasColonPrefix1 = Object.keys(props1).some(k => k.startsWith(':'))
      const hasColonPrefix2 = Object.keys(props2).some(k => k.startsWith(':'))
      const isUnified1 = !hasColonPrefix1
      const isUnified2 = !hasColonPrefix2

      const normalizedProps1 = normalizeProps(props1, isUnified1)
      const normalizedProps2 = normalizeProps(props2, isUnified2)
      const allKeys = new Set([...Object.keys(normalizedProps1), ...Object.keys(normalizedProps2)])

      for (const key of allKeys) {
        const value1 = normalizedProps1[key]
        const value2 = normalizedProps2[key]

        // Normalize values for comparison (handle arrays, objects, etc.)
        if (Array.isArray(value1) && Array.isArray(value2)) {
          expect(
            value1,
            `${testCase}: ${path}.props.${key} - array should match`,
          ).toEqual(value2)
        }
        else {
          expect(
            value1,
            `${testCase}: ${path}.props.${key} - value should match (got ${JSON.stringify(value1)} vs ${JSON.stringify(value2)})`,
          ).toEqual(value2)
        }
      }
    }
  }
  else if (node1.type === 'text') {
    // Compare text values (normalized)
    const value1 = typeof node1.value === 'string' ? node1.value.trim() : node1.value
    const value2 = typeof node2.value === 'string' ? node2.value.trim() : node2.value
    expect(
      value1,
      `${testCase}: ${path} - text value should match (got "${value1}" vs "${value2}")`,
    ).toBe(value2)
  }
  else if (node1.type === 'comment') {
    // Compare comment values
    expect(
      node1.value,
      `${testCase}: ${path} - comment value should match`,
    ).toBe(node2.value)
  }
}

function compareResults(result1: ParseResult, result2: ParseResult, testCase: string) {
  // Compare data (frontmatter)
  expect(result1.data, `${testCase}: data should match`).toEqual(result2.data)

  // Normalize structures for comparison
  const body1 = normalizeStructure(result1.body)
  const body2 = normalizeStructure(result2.body)

  // Deep compare body structures
  deepCompareNodes(body1, body2, 'body', testCase)

  // Deep compare excerpt if present
  if (result1.excerpt || result2.excerpt) {
    if (result1.excerpt && result2.excerpt) {
      const excerpt1 = normalizeStructure(result1.excerpt)
      const excerpt2 = normalizeStructure(result2.excerpt)
      deepCompareNodes(excerpt1, excerpt2, 'excerpt', testCase)
    }
    else {
      // One has excerpt, the other doesn't
      expect(
        result1.excerpt,
        `${testCase}: excerpt presence should match`,
      ).toBeDefined()
      expect(
        result2.excerpt,
        `${testCase}: excerpt presence should match`,
      ).toBeDefined()
    }
  }
}

const testCases = [
  {
    name: 'simple heading',
    content: '# Hello World',
  },
  // {
  //   name: 'component in heading',
  //   content: '### :hello',
  //   weight: 1000,
  // },
  {
    name: 'simple paragraph',
    content: 'This is a paragraph.',
  },
  {
    name: 'multiple paragraphs',
    content: 'First paragraph.\n\nSecond paragraph.',
  },
  {
    name: 'multiple heading levels',
    content: '# H1 Heading\n## H2 Heading\n### H3 Heading',
  },
  {
    name: 'heading with paragraph',
    content: '# Title\n\nThis is a paragraph.',
  },
  {
    name: 'list items',
    content: '- Item 1\n- Item 2\n- Item 3',
  },
  {
    name: 'ordered list',
    content: '1. First item\n2. Second item\n3. Third item',
  },
  {
    name: 'bold and italic',
    content: 'This is **bold** and this is *italic*.',
  },
  {
    name: 'code inline',
    content: 'This is `inline code`.',
  },
  {
    name: 'code block',
    content: '```\nconst x = 1;\n```',
  },
  {
    name: 'code block with language',
    content: '```javascript\nconst x = 1;\n```',
  },
  // {
  //   name: 'code block with filename',
  //   content: '```javascript [filename.js]\nconst x = 1;\n```',
  // },
  {
    name: 'link',
    content: 'This is a [link](https://example.com).',
  },
  {
    name: 'image',
    content: '![alt text](https://example.com/image.png)',
  },
  {
    name: 'blockquote',
    content: '> This is a blockquote.',
  },
  {
    name: 'horizontal rule',
    content: '---',
  },
  {
    name: 'with frontmatter',
    content: `---
title: Test Title
description: Test Description
---
# Content`,
  },
  {
    name: 'with frontmatter and content',
    content: `---
title: My Post
author: John Doe
---
# My Post Title

This is the content.`,
  },
  {
    name: 'mixed content',
    content: `# Main Title

This is a paragraph with **bold** and *italic* text.

## Subsection

- List item 1
- List item 2

\`\`\`javascript
console.log('code');
\`\`\``,
  },
  {
    name: 'empty content',
    content: '',
  },
  {
    name: 'whitespace only',
    content: '   \n\n\t  ',
  },
  {
    name: 'heading with special characters',
    content: '# Heading with "quotes" and (parentheses)',
  },
  {
    name: 'heading with numbers',
    content: '# Heading 123',
  },
  {
    name: 'component',
    content: '::component\n::',
  },
  {
    name: 'component with content',
    content: '::component\nThis is a component with content.\n::',
  },
  {
    name: 'component with content and attributes',
    content: '::component{data-component="test" #id .class-x .class-y boolean number=100}\nThis is a component with content and attributes.\n::',
  },
  {
    name: 'Nested components',
    content: ':::parent\n::child\n::\n:::',
  },
  {
    name: 'Component with Yaml attributes',
    content: '::component\n---\ntitle: Test Title\n---\n::',
  },
  {
    name: 'Alert Component',
    content: `::alert{type="info"}
Watch how **bold text** and components render correctly even when syntax arrives in chunks.
::`,
  },
  // Inline Components
  {
    name: 'inline component',
    content: 'Hello :world',
  },
  {
    name: 'inline component with attributes',
    content: 'Hello :world{data-component=\'test\'}',
  },
  {
    name: 'inline component with content and attributes',
    content: 'Hello :world[Inline Component Content]{data-component=\'test\'}',
  },
  // Span
  {
    name: 'span',
    content: 'Hello [World]',
  },
  {
    name: 'span with attributes',
    content: 'Hello [World]{data-component=\'test\'}',
  },
  // markdown native elements with attributes, bold, italic, code, link, image
  {
    name: 'bold with attributes',
    content: 'Hello **World**{data-component=\'test\'}',
  },
  {
    name: 'italic with attributes',
    content: 'Hello *italic*{data-component=\'test\'}',
  },
  {
    name: 'code with attributes',
    content: 'Hello `code`{data-component=\'test\'}',
  },
  {
    name: 'link with attributes',
    content: 'Hello [World](https://example.com){data-component=\'test\'}',
  },
  {
    name: 'image with attributes',
    content: 'Hello ![World](https://example.com/image.png){data-component=\'test\'}',
  },
  // Tables
  {
    name: 'simple table',
    content: `| Header 1 | Header 2 |
|----------|----------|
| Cell 1   | Cell 2   |`,
  },
  {
    name: 'table with alignment',
    content: `| Left | Center | Right |
|:-----|:------:|------:|
| A    | B      | C     |`,
  },
  {
    name: 'table with inline markdown',
    content: `| Name | Description |
|------|-------------|
| **Bold** | *Italic* text |
| \`code\` | [link](https://example.com) |`,
  },
  {
    name: 'table with empty cells',
    content: `| Col1 | Col2 | Col3 |
|------|------|------|
| A    |      | C    |
|      | B    |      |`,
  },
  {
    name: 'nested container with YAML styles and code block',
    content: `::container{padding="0px"}
  :::container
  ---
  styles: |
    pre {
      border: 1px solid red !important;

      span {
        line-height: 1;
      }
    }
  ---
  This container has a code block.

  \`\`\`
  function test() {
    // console.log("test");
  }
  \`\`\`
  :::
::`,
  },
  {
    name: 'nested container with YAML styles and code block with language',
    content: `::container{padding="0px"}
  :::container
  ---
  styles: |
    pre {
      border: 1px solid red !important;

      span {
        line-height: 1;
      }
    }
  ---
  This container has a code block.

  \`\`\`js
  function test() {
    // console.log("test");
  }
  \`\`\`
  :::
::`,
  },
  // TODO
  // component in bold
  // {
  //   name: 'inline component in bold',
  //   content: '**:component[text]{.class}**'
  // },
  // Bindings
  // {
  //   name: "binding",
  //   content: "Hello {{world}}",
  // },
  // {
  //   name: "binding with default value",
  //   content: "Hello {{ world || default }}"
  // },
]

testCases.sort((a, b) => ((a as any).weight || 0) - ((b as any).weight || 0))
describe('compare parseWithRemark and parse', () => {
  testCases.forEach((testCase) => {
    it(`should produce similar results for: ${testCase.name}`, () => {
      const result1 = parseWithRemark(testCase.content) as ParseResult
      // Disable autoUnwrap to match remark-mdc output structure
      const result2 = parse(testCase.content, { autoUnwrap: false }) as ParseResult

      // Both should return valid structures
      expect(result1, `${testCase.name}: parseWithRemark should return result`).toBeDefined()
      expect(result2, `${testCase.name}: parse should return result`).toBeDefined()
      expect(result1.body, `${testCase.name}: parseWithRemark body should be defined`).toBeDefined()
      expect(result2.body, `${testCase.name}: parse body should be defined`).toBeDefined()
      expect(result1.body.type, `${testCase.name}: parseWithRemark body type should be root`).toBe('root')
      expect(result2.body.type, `${testCase.name}: parse body type should be root`).toBe('root')

      // Compare results
      compareResults(result1, result2, testCase.name)
    })
  })
})

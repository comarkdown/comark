import { describe, expect, it } from 'vitest'
import { parse } from 'comark'
import { createMermaidPlugin } from '../src/index'

const mermaidPlugin = createMermaidPlugin()

describe('createMermaidPlugin', () => {
  it('should create a plugin with default config', () => {
    const plugin = createMermaidPlugin()
    expect(plugin).toBeDefined()
    expect(plugin.markdownItPlugins).toBeDefined()
    expect(plugin.markdownItPlugins?.length).toBeGreaterThan(0)
  })

  it('should create a plugin with custom config', () => {
    const plugin = createMermaidPlugin({ theme: 'dark' })
    expect(plugin).toBeDefined()
    expect(plugin.markdownItPlugins).toBeDefined()
  })

  it('should create a plugin with custom options', () => {
    const plugin = createMermaidPlugin({
      theme: 'forest',
      options: {
        fontFamily: 'Arial',
      },
    })
    expect(plugin).toBeDefined()
  })
})

describe('markdown-it integration', () => {
  it('should parse mermaid code block', () => {
    const markdown = `\`\`\`mermaid
graph TD
    A --> B
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('graph TD')
  })

  it('should parse flowchart diagram', () => {
    const markdown = `\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('graph TD')
    expect(ast).toContain('Start')
  })

  it('should parse sequence diagram', () => {
    const markdown = `\`\`\`mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob!
    Bob-->>Alice: Hello Alice!
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('sequenceDiagram')
    expect(ast).toContain('Alice')
  })

  it('should parse class diagram', () => {
    const markdown = `\`\`\`mermaid
classDiagram
    Animal <|-- Duck
    Animal : +int age
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('classDiagram')
  })

  it('should parse state diagram', () => {
    const markdown = `\`\`\`mermaid
stateDiagram-v2
    [*] --> Still
    Still --> Moving
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('stateDiagram')
  })

  it('should parse gantt chart', () => {
    const markdown = `\`\`\`mermaid
gantt
    title Project Timeline
    section Planning
    Task 1 :a1, 2024-01-01, 30d
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('gantt')
  })

  it('should parse pie chart', () => {
    const markdown = `\`\`\`mermaid
pie title Pets
    "Dogs" : 386
    "Cats" : 85
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('pie')
  })

  it('should parse ER diagram', () => {
    const markdown = `\`\`\`mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('erDiagram')
  })

  it('should parse git graph', () => {
    const markdown = `\`\`\`mermaid
gitGraph
    commit
    branch develop
    checkout develop
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('gitGraph')
  })

  it('should not parse non-mermaid code blocks', () => {
    const markdown = `\`\`\`javascript
const x = 1
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).not.toContain('"mermaid"')
    expect(ast).toContain('javascript')
  })

  it('should handle multiple mermaid blocks', () => {
    const markdown = `\`\`\`mermaid
graph TD
    A --> B
\`\`\`

Some text

\`\`\`mermaid
sequenceDiagram
    Alice->>Bob: Hi
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('graph TD')
    expect(ast).toContain('sequenceDiagram')
  })

  it('should handle text without mermaid', () => {
    const text = 'No diagrams here'
    const result = parse(text, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).not.toContain('"mermaid"')
  })
})

describe('complex mermaid diagrams', () => {
  it('should handle complex flowchart with styling', () => {
    const markdown = `\`\`\`mermaid
graph TB
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('Christmas')
  })

  it('should handle multiline sequence diagram', () => {
    const markdown = `\`\`\`mermaid
sequenceDiagram
    participant User
    participant App
    participant API
    User->>App: Request data
    App->>API: Fetch data
    API-->>App: Return data
    App-->>User: Display data
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('participant')
  })

  it('should handle diagram with notes', () => {
    const markdown = `\`\`\`mermaid
sequenceDiagram
    Alice->>John: Hello John
    Note right of John: John thinks
    John-->>Alice: Hi Alice
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('Note')
  })
})

describe('edge cases', () => {
  it('should handle empty mermaid block', () => {
    const markdown = `\`\`\`mermaid
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    expect(result.body.value).toBeDefined()
  })

  it('should handle mermaid block with whitespace', () => {
    const markdown = `\`\`\`mermaid

graph TD
    A --> B

\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
  })

  it('should handle mermaid with markdown around it', () => {
    const markdown = `# Heading

\`\`\`mermaid
graph TD
    A --> B
\`\`\`

Some text after`
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('Heading')
  })

  it('should handle mermaid in lists', () => {
    const markdown = `- Item 1
  \`\`\`mermaid
  graph TD
      A --> B
  \`\`\`
- Item 2`
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
  })

  it('should not parse inline code as mermaid', () => {
    const result = parse('Inline `mermaid` code', { plugins: [mermaidPlugin] })
    const p = result.body.value[0] as any[]
    // Should have code element, not mermaid element
    expect(p[0]).toBe('p')
    expect(p.some(child => Array.isArray(child) && child[0] === 'code')).toBe(true)
    expect(p.some(child => Array.isArray(child) && child[0] === 'mermaid')).toBe(false)
  })

  it('should preserve indentation in mermaid code', () => {
    const markdown = `\`\`\`mermaid
graph TD
    A --> B
        B --> C
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('A --> B')
  })
})

describe('integration with other markdown features', () => {
  it('should work with headings and mermaid', () => {
    const markdown = `# Diagram

\`\`\`mermaid
graph TD
    A --> B
\`\`\`

## Another Section`
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('h1')
    expect(ast).toContain('mermaid')
    expect(ast).toContain('h2')
  })

  it('should work with blockquotes', () => {
    const markdown = `> Quote
>
> \`\`\`mermaid
> graph TD
>     A --> B
> \`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('blockquote')
  })

  it('should work with other code blocks', () => {
    const markdown = `\`\`\`javascript
const x = 1
\`\`\`

\`\`\`mermaid
graph TD
    A --> B
\`\`\`

\`\`\`python
x = 1
\`\`\``
    const result = parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result.body)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('javascript')
    expect(ast).toContain('python')
  })
})

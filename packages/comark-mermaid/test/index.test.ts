import { describe, expect, it } from 'vitest'
import { parse } from 'comark'
import comarkMermaid from '../src/index'

const mermaidPlugin = comarkMermaid()

describe('comarkMermaid', () => {
  it('should create a plugin with default config', async () => {
    const plugin = comarkMermaid()
    expect(plugin).toBeDefined()
    expect(plugin.markdownItPlugins).toBeDefined()
    expect(plugin.markdownItPlugins?.length).toBeGreaterThan(0)
  })

  it('should create a plugin with custom config', async () => {
    const plugin = comarkMermaid({ theme: 'dark' })
    expect(plugin).toBeDefined()
    expect(plugin.markdownItPlugins).toBeDefined()
  })

  it('should create a plugin with custom options', async () => {
    const plugin = comarkMermaid({ theme: 'forest' })
    expect(plugin).toBeDefined()
  })
})

describe('markdown-it integration', () => {
  it('should parse mermaid code block', async () => {
    const markdown = `\`\`\`mermaid
graph TD
    A --> B
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('graph TD')
  })

  it('should parse flowchart diagram', async () => {
    const markdown = `\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('graph TD')
    expect(ast).toContain('Start')
  })

  it('should parse sequence diagram', async () => {
    const markdown = `\`\`\`mermaid
sequenceDiagram
    Alice->>Bob: Hello Bob!
    Bob-->>Alice: Hello Alice!
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('sequenceDiagram')
    expect(ast).toContain('Alice')
  })

  it('should parse class diagram', async () => {
    const markdown = `\`\`\`mermaid
classDiagram
    Animal <|-- Duck
    Animal : +int age
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('classDiagram')
  })

  it('should parse state diagram', async () => {
    const markdown = `\`\`\`mermaid
stateDiagram-v2
    [*] --> Still
    Still --> Moving
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('stateDiagram')
  })

  it('should parse gantt chart', async () => {
    const markdown = `\`\`\`mermaid
gantt
    title Project Timeline
    section Planning
    Task 1 :a1, 2024-01-01, 30d
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('gantt')
  })

  it('should parse pie chart', async () => {
    const markdown = `\`\`\`mermaid
pie title Pets
    "Dogs" : 386
    "Cats" : 85
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('pie')
  })

  it('should parse ER diagram', async () => {
    const markdown = `\`\`\`mermaid
erDiagram
    CUSTOMER ||--o{ ORDER : places
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('erDiagram')
  })

  it('should parse git graph', async () => {
    const markdown = `\`\`\`mermaid
gitGraph
    commit
    branch develop
    checkout develop
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('gitGraph')
  })

  it('should not parse non-mermaid code blocks', async () => {
    const markdown = `\`\`\`javascript
const x = 1
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).not.toContain('"mermaid"')
    expect(ast).toContain('javascript')
  })

  it('should handle multiple mermaid blocks', async () => {
    const markdown = `\`\`\`mermaid
graph TD
    A --> B
\`\`\`

Some text

\`\`\`mermaid
sequenceDiagram
    Alice->>Bob: Hi
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('graph TD')
    expect(ast).toContain('sequenceDiagram')
  })

  it('should handle text without mermaid', async () => {
    const text = 'No diagrams here'
    const result = await parse(text, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).not.toContain('"mermaid"')
  })
})

describe('complex mermaid diagrams', () => {
  it('should handle complex flowchart with styling', async () => {
    const markdown = `\`\`\`mermaid
graph TB
    A[Christmas] -->|Get money| B(Go shopping)
    B --> C{Let me think}
    C -->|One| D[Laptop]
    C -->|Two| E[iPhone]
    C -->|Three| F[Car]
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('Christmas')
  })

  it('should handle multiline sequence diagram', async () => {
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
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('participant')
  })

  it('should handle diagram with notes', async () => {
    const markdown = `\`\`\`mermaid
sequenceDiagram
    Alice->>John: Hello John
    Note right of John: John thinks
    John-->>Alice: Hi Alice
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('Note')
  })
})

describe('edge cases', () => {
  it('should handle empty mermaid block', async () => {
    const markdown = `\`\`\`mermaid
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    expect(result.nodes).toBeDefined()
  })

  it('should handle mermaid block with whitespace', async () => {
    const markdown = `\`\`\`mermaid

graph TD
    A --> B

\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
  })

  it('should handle mermaid with markdown around it', async () => {
    const markdown = `# Heading

\`\`\`mermaid
graph TD
    A --> B
\`\`\`

Some text after`
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('Heading')
  })

  it('should handle mermaid in lists', async () => {
    const markdown = `- Item 1
  \`\`\`mermaid
  graph TD
      A --> B
  \`\`\`
- Item 2`
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
  })

  it('should not parse inline code as mermaid', async () => {
    const result = await parse('Inline `mermaid` code', { plugins: [mermaidPlugin] })
    const p = result.nodes[0] as any[]
    // Should have code element, not mermaid element
    expect(p[0]).toBe('p')
    expect(p.some(child => Array.isArray(child) && child[0] === 'code')).toBe(true)
    expect(p.some(child => Array.isArray(child) && child[0] === 'mermaid')).toBe(false)
  })

  it('should preserve indentation in mermaid code', async () => {
    const markdown = `\`\`\`mermaid
graph TD
    A --> B
        B --> C
\`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('A --> B')
  })
})

describe('integration with other markdown features', () => {
  it('should work with headings and mermaid', async () => {
    const markdown = `# Diagram

\`\`\`mermaid
graph TD
    A --> B
\`\`\`

## Another Section`
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('h1')
    expect(ast).toContain('mermaid')
    expect(ast).toContain('h2')
  })

  it('should work with blockquotes', async () => {
    const markdown = `> Quote
>
> \`\`\`mermaid
> graph TD
>     A --> B
> \`\`\``
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('blockquote')
  })

  it('should work with other code blocks', async () => {
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
    const result = await parse(markdown, { plugins: [mermaidPlugin] })
    const ast = JSON.stringify(result)
    expect(ast).toContain('mermaid')
    expect(ast).toContain('javascript')
    expect(ast).toContain('python')
  })
})

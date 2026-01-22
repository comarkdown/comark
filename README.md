# MDC Syntax

A high-performance markdown parser with MDC (Markdown Components) support, built on markdown-it, offering both string-based and streaming APIs.

> [!CAUTION]
> This package is currently under active development and may change frequently.

## Features

- 🚀 Fast markdown-it based parser
- 📦 Stream API with both buffered and incremental modes
- ⚡ Incremental parsing for real-time UI updates
- 🔧 MDC component syntax support
- 🔒 Auto-close unclosed markdown syntax (perfect for streaming)
- 📝 Frontmatter parsing (YAML)
- 📑 Automatic table of contents generation
- 🎯 Full TypeScript support
- 📊 Progress tracking built-in for streams
- 🧪 Remark parser available for testing comparisons

## Installation

```bash
npm install mdc-syntax
# or
pnpm add mdc-syntax
```

## Quick Start

### String-based Parsing

```typescript
import { parse } from 'mdc-syntax'

const content = `---
title: Hello World
---

# Hello World

This is a **markdown** document with *MDC* components.

::alert{type="info"}
This is an alert component
::
`

const result = parse(content)

console.log(result.body) // MDC AST
console.log(result.data) // { title: 'Hello World' }
console.log(result.toc) // Table of contents
```

### Stream-based Parsing

#### Buffered Streaming (wait for complete result)

```typescript
import { createReadStream } from 'node:fs'
import { parseStream } from 'mdc-syntax/stream'

// Parse from file stream
const stream = createReadStream('content.md')
const result = await parseStream(stream)

console.log(result.body)
console.log(result.data)
console.log(result.toc)
```

```typescript
// Parse from HTTP stream
const response = await fetch('https://example.com/content.md')
const result = await parseStream(response.body!)

console.log(result.body)
```

#### Incremental Streaming (real-time updates)

**Auto-close is automatically applied!** Unclosed markdown syntax and components are auto-closed before parsing each chunk, ensuring valid output even with incomplete content.

```typescript
import { parseStreamIncremental } from 'mdc-syntax/stream'

const response = await fetch('https://example.com/article.md')

for await (const result of parseStreamIncremental(response.body!)) {
  if (!result.isComplete) {
    // Update UI as chunks arrive - auto-close ensures valid parsing!
    console.log(`Received chunk: ${result.chunk.length} bytes`)
    console.log(`Current elements: ${result.body.children.length}`)
    renderPartialContent(result.body)
  }
  else {
    // Final result with complete TOC
    console.log('Complete!', result.toc)
    renderFinalContent(result.body)
  }
}
```

## API

### String API

#### `parse(source: string): ParseResult`

Parses MDC content from a string.

**Parameters:**
- `source` - The markdown/MDC content as a string

**Returns:**
- `ParseResult` - Object containing `body`, `excerpt`, `data`, and `toc`

### Stream API

#### Buffered Streaming

##### `parseStream(stream: Readable | ReadableStream<Uint8Array>): Promise<ParseResult>`

Asynchronously parses MDC content from a stream.

**Parameters:**
- `stream` - A Node.js Readable stream or Web ReadableStream

**Returns:**
- `Promise<ParseResult>` - Promise resolving to parsed result

#### Incremental Streaming

##### `parseStreamIncremental(stream: Readable | ReadableStream<Uint8Array>): AsyncGenerator<IncrementalParseResult>`

Parses MDC content incrementally, yielding results after each chunk.

**Parameters:**
- `stream` - A Node.js Readable stream or Web ReadableStream

**Yields:**
- `IncrementalParseResult` - Progressive results for each chunk

### Types

```typescript
interface ParseResult {
  body: MDCRoot // The parsed MDC AST
  excerpt?: MDCRoot // Optional excerpt (content before <!-- more -->)
  data: any // Frontmatter data
  toc?: any // Table of contents
}

interface IncrementalParseResult {
  chunk: string // The chunk just received
  body: MDCRoot // Current parsed state
  data: any // Frontmatter data (once available)
  isComplete: boolean // Whether stream is finished
  excerpt?: MDCRoot // Optional excerpt
  toc?: any // TOC (only in final result)
}

interface MDCRoot {
  type: 'root'
  children: MDCNode[]
}

interface MDCNode {
  type: 'element' | 'text' | 'comment'
  // ... additional properties based on type
}
```

## MDC Syntax Support

MDC (Markdown Components) extends standard markdown with component syntax:

### Block Components

```markdown
::component-name{prop1="value" prop2="value"}
Content goes here
::
```

### Inline Components

```markdown
:component-name{prop="value"}
:component-name[content]{prop="value"}
```

### Attributes on Native Elements

```markdown
**bold text**{.custom-class #id}
[link](url){target="_blank"}
![image](url){.image-class}
```

## Auto-Close Unclosed Syntax

For streaming scenarios or incomplete content, use `autoCloseMarkdown` to automatically close unclosed syntax:

```typescript
import { autoCloseMarkdown, detectUnclosedSyntax, parse } from 'mdc-syntax'

// Auto-close unclosed inline markdown
const partial = '**bold text'
const closed = autoCloseMarkdown(partial)
// Result: '**bold text**'

// Auto-close unclosed MDC components
const component = '::alert{type="info"}\nImportant message'
const closedComponent = autoCloseMarkdown(component)
// Result: '::alert{type="info"}\nImportant message\n::'

// Detect what's unclosed without modifying
const detection = detectUnclosedSyntax('::card\nText with **bold')
console.log(detection)
// {
//   hasUnclosed: true,
//   unclosedInline: ['**bold**'],
//   unclosedComponents: [{ markerCount: 2, name: 'card' }]
// }

// Use with streaming
async function* parseStreamWithAutoClose(stream) {
  let accumulated = ''
  for await (const chunk of stream) {
    accumulated += chunk.toString()
    const closed = autoCloseMarkdown(accumulated)
    const parsed = parse(closed)
    yield parsed
  }
}
```

## Examples

### Processing Multiple Files

```typescript
import { createReadStream } from 'node:fs'
import { readdir } from 'node:fs/promises'
import { join } from 'node:path'
import { parseStream } from 'mdc-syntax/stream'

async function processMarkdownDirectory(dir: string) {
  const files = await readdir(dir)
  const mdFiles = files.filter(f => f.endsWith('.md'))

  const results = await Promise.all(
    mdFiles.map(async (file) => {
      const stream = createReadStream(join(dir, file))
      const result = await parseStream(stream)
      return { file, result }
    })
  )

  return results
}
```

### Chunked Stream Processing

```typescript
import { Readable } from 'node:stream'
import { parseStream } from 'mdc-syntax/stream'

const chunks = ['# Hello', ' World\n\n', 'Content here']
const stream = Readable.from(chunks)
const result = await parseStream(stream)
```

### Web Stream (Browser/Fetch)

```typescript
import { parseStream } from 'mdc-syntax/stream'

const response = await fetch('/api/content')
if (response.body) {
  const result = await parseStream(response.body)
  console.log(result.body)
}
```

## Performance

The library offers excellent performance for large documents with efficient memory usage.

See [tests/benchmark.test.ts](tests/benchmark.test.ts) for detailed performance comparisons.

## Testing

```bash
npm test
# or
pnpm test
```

Run specific test suites:

```bash
npm test -- tests/stream.test.ts
npm test -- tests/compare-parsers.test.ts
```

## License

ISC

## Contributing

Contributions are welcome! Please ensure all tests pass before submitting a PR.

```bash
pnpm install
pnpm test
```

// ─── Comark Parser State ───
export const defaultMarkdown = `---
title: Hello Comark
description: A Comark playground
---

# Hello Comark

This is a **Comark** playground inside DevTools.

Write Markdown with component syntax and see the parsed AST in real-time.

## Features

- **Bold** and *italic* text
- [Links](https://github.com/comarkdown/comark)
- Lists and task lists

### Task List

- [x] Parse markdown
- [x] Generate AST
- [ ] Render components

### Component Syntax

::note
This is a Comark component using MDC syntax.
::

### Code Block

\`\`\`typescript
import { parse } from 'comark'

const tree = await parse('# Hello World')
console.log(tree.nodes)
\`\`\`

### Table

| Feature | Status |
|---------|--------|
| Parsing | ✅ |
| Streaming | ✅ |
| Vue | ✅ |
| React | ✅ |
`

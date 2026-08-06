export const content = `# Rangi Highlight Examples

The \`rangi\` plugin provides lightweight syntax highlighting using [rangi](https://github.com/pi0/rangi) — tiny, zero-dependency, fully synchronous, with built-in light/dark themes.

Prefer this when bundle size and cold-start matter. For transformers or Twoslash, use the [Shiki plugin](https://comark.dev/plugins/built-in/syntax-highlight) instead.

## JavaScript

\`\`\`javascript
// Array methods
const numbers = [1, 2, 3, 4, 5]
const doubled = numbers.map(n => n * 2)
const sum = numbers.reduce((acc, n) => acc + n, 0)

// Async/await
async function fetchData(url) {
  const response = await fetch(url)
  return response.json()
}

// Classes
class Animal {
  constructor(name) {
    this.name = name
  }

  speak() {
    console.log(\`\${this.name} makes a sound\`)
  }
}
\`\`\`

## TypeScript

\`\`\`typescript
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

async function getData<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(endpoint)
  return response.json()
}

function isString(value: unknown): value is string {
  return typeof value === 'string'
}
\`\`\`

## Comark

Comark ships its own rangi grammar, registered for the \`comark\`, \`mdc\`, \`md\` and \`markdown\` fences — so the syntax on this page highlights itself:

\`\`\`\`comark
---
title: Comark highlights itself
tags: [markdown, components]
---

# Heading{#custom-id .lead}

Standard **bold**, _italic_, \`code\` and [links](https://comark.dev) still work.

::alert{type="warning" .rounded}
An :icon{name="triangle"} inline component, a [span]{.accent},
and a {{ user.name || Anonymous }} binding.

#footer
Named slot content.
::

::card
---
title: YAML props are highlighted as YAML
icon: zap
---
::

> [!NOTE]
> Alerts, task lists and :emoji: shortcodes too.

- [x] done
- [ ] todo
\`\`\`\`

## Line highlighting

Fence info \`{2-3,5}\` marks specific lines with \`.highlight\`:

\`\`\`javascript {2-3,5}
function example() {
  const a = 1  // highlighted
  const b = 2  // highlighted
  const c = 3
  return a + b + c  // highlighted
}
\`\`\`

## Python

\`\`\`python
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

## Rust

\`\`\`rust
fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);
    println!("Length of '{}' is {}.", s1, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}
\`\`\`

## Go

\`\`\`go
package main

import "fmt"

func main() {
    fmt.Println("Hello, rangi")
}
\`\`\`

## SQL

\`\`\`sql
SELECT u.id, u.name, COUNT(o.id) as order_count
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
GROUP BY u.id, u.name
HAVING COUNT(o.id) > 0
ORDER BY order_count DESC;
\`\`\`

## CSS

\`\`\`css
:root {
  --primary: #3b82f6;
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}
\`\`\`

## JSON

\`\`\`json
{
  "name": "comark",
  "dependencies": {
    "rangi": "^2.2.0"
  }
}
\`\`\`

## Shell

\`\`\`bash
#!/bin/bash
for file in *.ts; do
  echo "Processing: $file"
done
\`\`\`

## Diff

\`\`\`diff
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,5 +1,6 @@
 import { parseMarkdown } from 'comark'
-import shiki from 'comark/plugins/shiki'
+import rangi from 'comark/plugins/rangi'

 const result = await parseMarkdown(content, {
-  plugins: [shiki()]
+  plugins: [rangi()]
 })
\`\`\`

## YAML

\`\`\`yaml
name: ci
on:
  push:
    branches: [main]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - run: pnpm test
\`\`\`
`

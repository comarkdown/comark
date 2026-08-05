export const content = `# Speed Highlight Examples

The \`speed-highlight\` plugin provides lightweight syntax highlighting using [@speed-highlight/core](https://github.com/speed-highlight/core) — ~2kB core, class-based tokens, zero dependencies.

Prefer this when bundle size and cold-start matter. For dual themes, transformers, or Twoslash, use the [Shiki highlight](https://comark.dev/plugins/built-in/syntax-highlight) plugin instead.

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
// Generics and interfaces
interface ApiResponse<T> {
  data: T
  status: number
  message: string
}

async function getData<T>(endpoint: string): Promise<ApiResponse<T>> {
  const response = await fetch(endpoint)
  return response.json()
}

// Type guards
function isString(value: unknown): value is string {
  return typeof value === 'string'
}

// Utility types
type ReadOnly<T> = {
  readonly [K in keyof T]: T[K]
}
\`\`\`

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
# List comprehensions
squares = [x**2 for x in range(10)]
evens = [x for x in range(20) if x % 2 == 0]

# Decorators
def timer(func):
    def wrapper(*args, **kwargs):
        import time
        start = time.time()
        result = func(*args, **kwargs)
        print(f"Time: {time.time() - start}s")
        return result
    return wrapper

@timer
def fibonacci(n):
    if n <= 1:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
\`\`\`

## Rust

\`\`\`rust
// Ownership and borrowing
fn main() {
    let s1 = String::from("hello");
    let len = calculate_length(&s1);
    println!("Length of '{}' is {}.", s1, len);
}

fn calculate_length(s: &String) -> usize {
    s.len()
}

// Pattern matching
enum Message {
    Quit,
    Move { x: i32, y: i32 },
    Write(String),
}

fn process_message(msg: Message) {
    match msg {
        Message::Quit => println!("Quit"),
        Message::Move { x, y } => {
            println!("Move to ({}, {})", x, y)
        }
        Message::Write(text) => println!("{}", text),
    }
}
\`\`\`

## Go

\`\`\`go
package main

import (
    "fmt"
    "sync"
)

func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d processing job %d\\n", id, j)
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)

    var wg sync.WaitGroup
    for w := 1; w <= 3; w++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            worker(id, jobs, results)
        }(w)
    }

    for j := 1; j <= 9; j++ {
        jobs <- j
    }
    close(jobs)

    wg.Wait()
    close(results)
}
\`\`\`

## SQL

\`\`\`sql
-- Complex query with joins and aggregations
SELECT
    u.id,
    u.name,
    COUNT(o.id) as order_count,
    SUM(o.total) as total_spent,
    AVG(o.total) as avg_order_value
FROM users u
LEFT JOIN orders o ON u.id = o.user_id
WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 1 YEAR)
GROUP BY u.id, u.name
HAVING total_spent > 1000
ORDER BY total_spent DESC
LIMIT 10;
\`\`\`

## CSS

\`\`\`css
/* Modern CSS features */
:root {
  --primary: #3b82f6;
  --spacing: 1rem;
}

.container {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: var(--spacing);
  padding: var(--spacing);
}

.card {
  display: flex;
  flex-direction: column;
  border-radius: 0.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s;
}

.card:hover {
  transform: translateY(-4px);
}
\`\`\`

## JSON

\`\`\`json
{
  "name": "comark",
  "version": "1.0.0",
  "description": "Components in Markdown",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest"
  },
  "dependencies": {
    "@speed-highlight/core": "^1.2.23",
    "comark": "^0.6.0"
  },
  "keywords": ["markdown", "parser", "highlight"],
  "license": "MIT"
}
\`\`\`

## Shell

\`\`\`bash
#!/bin/bash

# Variables and arrays
FILES=("*.js" "*.ts" "*.vue")
COUNT=0

# Loops and conditionals
for pattern in "\${FILES[@]}"; do
  for file in $pattern; do
    if [ -f "$file" ]; then
      echo "Processing: $file"
      COUNT=$((COUNT + 1))
    fi
  done
done

echo "Processed $COUNT files"

check_dependencies() {
  local deps=("node" "npm" "git")
  for cmd in "\${deps[@]}"; do
    if ! command -v "$cmd" &> /dev/null; then
      echo "Error: $cmd not found"
      return 1
    fi
  done
  return 0
}

check_dependencies && echo "All dependencies installed"
\`\`\`

## HTML

\`\`\`html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Comark</title>
    <link rel="stylesheet" href="styles.css" />
  </head>
  <body>
    <main id="app">
      <h1 class="title">Hello, world</h1>
      <script src="app.js"></script>
    </main>
  </body>
</html>
\`\`\`

## Diff

\`\`\`diff
--- a/src/index.ts
+++ b/src/index.ts
@@ -1,5 +1,6 @@
 import { parseMarkdown } from 'comark'
-import highlight from 'comark/plugins/highlight'
+import speedHighlight from 'comark/plugins/speed-highlight'

 const result = await parseMarkdown(content, {
-  plugins: [highlight()]
+  plugins: [speedHighlight()]
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
      - uses: actions/checkout@v4
      - run: pnpm install
      - run: pnpm test
\`\`\`

## Markdown

\`\`\`markdown
# Heading 1

**Bold text** and *italic text*

- Unordered list
- With multiple items

\`inline code\` and [links](https://comark.dev)

> Blockquote

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
\`\`\`
`

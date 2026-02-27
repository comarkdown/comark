export const content = `# Syntax Highlighting Examples

The \`highlight\` plugin provides beautiful syntax highlighting using [Shiki](https://shiki.style/) with support for multiple themes and 180+ languages.

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

## Vue

\`\`\`vue
<script setup lang="ts">
import { ref, computed } from 'vue'

const count = ref(0)
const doubled = computed(() => count.value * 2)

function increment() {
  count.value++
}
</script>

<template>
  <div>
    <p>Count: {{ count }}</p>
    <p>Doubled: {{ doubled }}</p>
    <button @click="increment">Increment</button>
  </div>
</template>

<style scoped>
button {
  padding: 0.5rem 1rem;
  border-radius: 0.25rem;
}
</style>
\`\`\`

## React

\`\`\`tsx
import { useState, useEffect } from 'react'

interface Todo {
  id: number
  text: string
  completed: boolean
}

export default function TodoApp() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')

  const addTodo = () => {
    if (input.trim()) {
      setTodos([...todos, {
        id: Date.now(),
        text: input,
        completed: false
      }])
      setInput('')
    }
  }

  return (
    <div className="app">
      <h1>Todos</h1>
      <input
        value={input}
        onChange={e => setInput(e.target.value)}
        onKeyPress={e => e.key === 'Enter' && addTodo()}
      />
      <button onClick={addTodo}>Add</button>
      <ul>
        {todos.map(todo => (
          <li key={todo.id}>{todo.text}</li>
        ))}
      </ul>
    </div>
  )
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

# Context managers
with open('file.txt', 'r') as f:
    content = f.read()
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

// Goroutines and channels
func worker(id int, jobs <-chan int, results chan<- int) {
    for j := range jobs {
        fmt.Printf("Worker %d processing job %d\\n", id, j)
        results <- j * 2
    }
}

func main() {
    jobs := make(chan int, 100)
    results := make(chan int, 100)

    // Start workers
    var wg sync.WaitGroup
    for w := 1; w <= 3; w++ {
        wg.Add(1)
        go func(id int) {
            defer wg.Done()
            worker(id, jobs, results)
        }(w)
    }

    // Send jobs
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

-- Window functions
SELECT
    product_name,
    category,
    price,
    AVG(price) OVER (PARTITION BY category) as avg_category_price,
    RANK() OVER (PARTITION BY category ORDER BY price DESC) as price_rank
FROM products;
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

/* Flexbox */
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

/* Media queries */
@media (prefers-color-scheme: dark) {
  :root {
    --background: #1a1a1a;
    --foreground: #e0e0e0;
  }
}
\`\`\`

## JSON

\`\`\`json
{
  "name": "comark",
  "version": "1.0.0",
  "description": "Components in Markdown",
  "main": "dist/index.js",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "test": "vitest"
  },
  "dependencies": {
    "markdown-it": "^14.0.0",
    "shiki": "^1.27.0"
  },
  "keywords": ["markdown", "parser", "vue", "react"],
  "author": "Comark Contributors",
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

# Functions
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

## Markdown

\`\`\`markdown
# Heading 1

## Heading 2

### Heading 3

**Bold text** and *italic text*

- Unordered list
- With multiple items
  - Nested items

1. Ordered list
2. Second item
3. Third item

\`inline code\` and code blocks

[Link text](https://example.com)

![Image alt](image.jpg)

> Blockquote with
> multiple lines

| Column 1 | Column 2 |
|----------|----------|
| Cell 1   | Cell 2   |
\`\`\`
`

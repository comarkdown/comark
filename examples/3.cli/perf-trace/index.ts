/**
 * Hierarchical perf trace for the Comark parse pipeline.
 *
 * Uses an OpenTelemetry-shaped recorder (`startSpan` / `startActiveSpan`).
 * Nested active spans form parent → child links via a stack (same shape as
 * OTel's active context; swap in `trace.getTracer('comark')` for real OTel).
 *
 * Run from repo root:
 *   pnpm --filter comark-perf-trace start
 *
 * Or from this directory:
 *   pnpm start
 */
import { createMarkdownParser, type ComarkTracer, type ComarkSpan, type ComarkSpanOptions } from 'comark'
import rangi from 'comark/plugins/rangi'
import toc from 'comark/plugins/toc'
import security from 'comark/plugins/security'

interface PerfEntry {
  name: string
  id: string
  parent?: string
  start: number
  duration: number
}

interface TraceNode {
  entry: PerfEntry
  children: TraceNode[]
}

function createTraceTracer() {
  const entries: PerfEntry[] = []
  const stack: string[] = []
  let nextId = 0

  function makeSpan(name: string): { span: ComarkSpan; id: string; parent?: string; start: number } {
    const id = `${name}:${++nextId}`
    const parent = stack[stack.length - 1]
    const start = performance.now()
    let ended = false
    const span: ComarkSpan = {
      end() {
        if (ended) return
        ended = true
        // Pop this id if it's still on the stack (active spans).
        const idx = stack.lastIndexOf(id)
        if (idx !== -1) stack.splice(idx, 1)
        entries.push({ name, id, parent, start, duration: performance.now() - start })
      },
    }
    return { span, id, parent, start }
  }

  const tracer: ComarkTracer = {
    startSpan(name) {
      // Non-active child of the current active span (if any).
      return makeSpan(name).span
    },
    startActiveSpan(
      name: string,
      optionsOrFn: ComarkSpanOptions | ((span: ComarkSpan) => unknown),
      fn?: (span: ComarkSpan) => unknown
    ) {
      const run = typeof optionsOrFn === 'function' ? optionsOrFn : fn!
      const { span, id } = makeSpan(name)
      stack.push(id)
      return run(span)
    },
  }

  return { tracer, entries }
}

/** Rebuild a tree from parent → id links. */
function buildTree(entries: PerfEntry[]): TraceNode[] {
  const byId = new Map<string, TraceNode>()
  const nodes: TraceNode[] = entries.map((entry) => {
    const node: TraceNode = { entry, children: [] }
    byId.set(entry.id, node)
    return node
  })

  const roots: TraceNode[] = []
  for (const node of nodes) {
    const parent = node.entry.parent ? byId.get(node.entry.parent) : undefined
    if (parent) parent.children.push(node)
    else roots.push(node)
  }

  const sortRecursive = (list: TraceNode[]) => {
    list.sort((a, b) => a.entry.start - b.entry.start)
    for (const child of list) sortRecursive(child.children)
  }
  sortRecursive(roots)
  return roots
}

function renderTree(nodes: TraceNode[], depth = 0): string[] {
  const lines: string[] = []
  for (const node of nodes) {
    const indent = '  '.repeat(depth)
    lines.push(`${indent}└─ ${node.entry.name}  ${node.entry.duration.toFixed(2)}ms  [${node.entry.id}]`)
    lines.push(...renderTree(node.children, depth + 1))
  }
  return lines
}

function renderWaterfall(entries: PerfEntry[], width = 48): string {
  if (!entries.length) return '(no spans recorded)'

  const byId = new Map(entries.map((e) => [e.id, e]))
  const depthOf = (entry: PerfEntry, seen = new Set<string>()): number => {
    if (!entry.parent || seen.has(entry.parent)) return 0
    seen.add(entry.parent)
    const parent = byId.get(entry.parent)
    return parent ? 1 + depthOf(parent, seen) : 1
  }

  const sorted = [...entries].sort((a, b) => a.start - b.start)
  const origin = sorted[0]!.start
  const windowMs = Math.max(...sorted.map((e) => e.start + e.duration - origin), 0.0001)
  const scale = width / windowMs
  const labelWidth = Math.max(...sorted.map((e) => e.name.length + depthOf(e) * 2))

  const lines = sorted.map((entry) => {
    const depth = depthOf(entry)
    const label = `${'  '.repeat(depth)}${entry.name}`.padEnd(labelWidth)
    const offset = Math.min(Math.round((entry.start - origin) * scale), width - 1)
    const len = Math.max(Math.round(entry.duration * scale), 1)
    const bar = ' '.repeat(offset) + '█'.repeat(Math.min(len, width - offset))
    const parentHint = entry.parent ? `  ← ${entry.parent}` : `  id=${entry.id}`
    return `${label}  ${bar.padEnd(width)}  ${entry.duration.toFixed(2)}ms${parentHint}`
  })

  return `comark:parse timeline (${windowMs.toFixed(2)}ms)\n${lines.join('\n')}`
}

const markdown = `---
title: Perf Trace
---

# Hello **world**

A paragraph with a [link](https://comark.dev) and \`code\`.

## Features

### Highlighting

\`\`\`ts
const greet = (name: string) => \`hi, \${name}\`
console.log(greet('comark'))
\`\`\`

### Security

<script>alert('xss')</script>

<img src="javascript:alert(1)" alt="blocked" />

[phish](javascript:alert(1))

## Components

::alert{type="info"}
Nested component body with **bold**.
::

- item one
- item two
`

const { tracer, entries } = createTraceTracer()
const parse = createMarkdownParser({
  tracer,
  plugins: [
    rangi(),
    toc({ depth: 3 }),
    security({
      blockedTags: ['script'],
      allowedLinkPrefixes: ['https:', 'http:', 'mailto:', '/'],
      allowedImagePrefixes: ['https:', 'http:', '/'],
    }),
  ],
})

const tree = await parse(markdown)

console.log(renderWaterfall(entries))
console.log()
console.log(`parsed ${tree.nodes.length} top-level node(s), frontmatter:`, tree.frontmatter)
console.log('toc links:', JSON.stringify(tree.meta.toc?.links, null, 2))
console.log()
console.log('span tree (startActiveSpan hierarchy):')
console.log(renderTree(buildTree(entries)).join('\n'))

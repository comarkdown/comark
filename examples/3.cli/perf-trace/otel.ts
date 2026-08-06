/**
 * OpenTelemetry perf trace for the Comark parse pipeline.
 *
 * Install and start otel-front in one terminal:
 *   brew install mesaglio/otel-front/otel-front
 *   otel-front
 *
 * Then send this trace from the repo root:
 *   pnpm --filter comark-perf-trace otel
 *
 * Or from this directory:
 *   pnpm otel
 *
 * Open http://localhost:8000 to inspect the trace. To use another collector,
 * set OTEL_EXPORTER_OTLP_TRACES_ENDPOINT to its full traces endpoint.
 */
import { trace } from '@opentelemetry/api'
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto'
import { resourceFromAttributes } from '@opentelemetry/resources'
import { BatchSpanProcessor, NodeTracerProvider } from '@opentelemetry/sdk-trace-node'
import { createMarkdownParser } from 'comark'
import rangi from 'comark/plugins/rangi'
import toc from 'comark/plugins/toc'
import security from 'comark/plugins/security'

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

const exporter = new OTLPTraceExporter({
  url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ?? 'http://localhost:4318/v1/traces',
})
const provider = new NodeTracerProvider({
  resource: resourceFromAttributes({ 'service.name': 'comark-perf-trace' }),
  spanProcessors: [new BatchSpanProcessor(exporter)],
})

provider.register()

const parse = createMarkdownParser({
  perf: trace.getTracer('comark'),
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

try {
  const tree = await parse(markdown)

  console.log(`parsed ${tree.nodes.length} top-level node(s), frontmatter:`, tree.frontmatter)
  console.log('toc links:', JSON.stringify(tree.meta.toc?.links, null, 2))
} finally {
  // Flush the batch processor before this short-lived process exits.
  await provider.shutdown()
}

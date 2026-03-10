<script setup lang="ts">
import { Comark } from '@comark/vue'
import mermaid, { Mermaid } from '@comark/vue/plugins/mermaid'

const markdown = `
# Mermaid Diagram Example

## Flowchart

\`\`\`mermaid
graph TD
    A[Start] --> B{Is it working?}
    B -->|Yes| C[Great!]
    B -->|No| D[Debug]
    D --> A
\`\`\`

## Sequence Diagram

\`\`\`mermaid {theme='zinc-dark'}
sequenceDiagram
    participant User
    participant App
    participant API
    User->>App: Request data
    App->>API: Fetch data
    API-->>App: Return data
    App-->>User: Display data
\`\`\`
`
</script>

<template>
  <Suspense>
    <Comark
      :components="{ Mermaid }"
      :plugins="[mermaid()]"
    >
      {{ markdown }}
    </Comark>
  </Suspense>
</template>

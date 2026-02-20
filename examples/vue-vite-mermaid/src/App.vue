<script setup lang="ts">
import { Comark } from 'comark/vue'
import { Mermaid } from '@comark/mermaid/vue'
import mermaidPlugin from '@comark/mermaid'
import Alert from './components/Alert.vue'

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

\`\`\`mermaid
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
      :components="{ Alert, Mermaid }"
      :options="{ plugins: [mermaidPlugin()] }"
    >{{ markdown }}</Comark>
  </Suspense>
</template>

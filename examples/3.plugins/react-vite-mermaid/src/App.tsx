import { ComarkClient } from '@comark/react'
import mermaid, { Mermaid } from '@comark/react/plugins/mermaid'

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

## Class Diagram

\`\`\`mermaid
classDiagram
    class Animal {
        +String name
        +int age
        +makeSound() void
    }
    class Dog {
        +fetch() void
    }
    class Cat {
        +purr() void
    }
    Animal <|-- Dog
    Animal <|-- Cat
\`\`\`
`

export default function App() {
  return (
    <main className="max-w-2xl mx-auto prose">
      <ComarkClient
        markdown={markdown}
        components={{ Mermaid }}
        plugins={[mermaid()]}
      />
    </main>
  )
}

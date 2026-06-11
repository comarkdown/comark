/** A rich markdown sample used to showcase streaming rendering. */
export const SAMPLE = `# Streaming Markdown with Comark

This text is being **streamed token by token**, just like output from an
LLM. Comark's \`autoClose\` completes any *unterminated* syntax on every
chunk, so you never see broken \`**bold\` or half-open [links](https://comark.dev).

## Why it matters

- Renders **partial** markdown without flicker
- Reuses already-parsed nodes for speed
- Works with tables, code, math and components

### A task list

- [x] Parse incomplete markdown
- [x] Auto-close unterminated tokens
- [ ] Render the trailing caret

### A table

| Feature        | Comark | Notes                  |
| -------------- | :----: | ---------------------- |
| Auto-close     |   ✅   | regex-free, O(n)       |
| Incremental    |   ✅   | reuses parsed nodes    |
| Components     |   ✅   | \`::alert\`, and more   |

### Some code

\`\`\`ts
import { Streamdown } from '@comark/react/streamdown'

export function Chat({ text }: { text: string }) {
  return <Streamdown>{text}</Streamdown>
}
\`\`\`

> Completed blocks above are cached and won't re-parse as new text arrives.

::alert{type="warning"}
Comark components stream too — this alert auto-closes while incomplete.
::

### Math

Inline like $E = mc^2$, and a display block:

$$
\\int_0^\\infty e^{-x^2}\\,dx = \\frac{\\sqrt{\\pi}}{2}
$$

### A diagram

\`\`\`mermaid
graph LR
  A[Chunk] --> B[autoClose]
  B --> C[parse]
  C --> D[render]
\`\`\`

That's it — fully streamed, components and all.
`

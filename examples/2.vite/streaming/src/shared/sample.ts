export const SAMPLE_MARKDOWN = `# Streaming Markdown

Edit this text, then press **Stream** to replay it one chunk at a time. Each renderer
below receives the same \`streamed\` string, the same \`plugins\` and the same \`effects\`.

## What happens on each tick

- The partial source is parsed with \`streaming: true\`, so unfinished syntax is auto-closed.
- Stream effects such as \`fade\` and \`caret\` decorate the new text.
- Unclosed openers like \`*emph\` or \`[link\` never flash as literal text.

> Blockquotes, [links](https://comark.dev) and \`inline code\` stream too.

| Renderer | Package           |
| -------- | ----------------- |
| Vue      | \`@comark/vue\`     |
| React    | \`@comark/react\`   |
| Svelte   | \`@comark/svelte\`  |
| Angular  | \`@comark/angular\` |

\`\`\`ts
import { createStreamRenderer, fade, caret } from 'comark/stream'

const stream = createStreamRenderer()
const nodes = stream.render(doc.nodes, { streaming: true, effects: [fade(), caret()] })
\`\`\`

1. Type anything in the editor on the left.
2. Tune the chunk size and delay.
3. Compare how each framework shows the same partial document.
`

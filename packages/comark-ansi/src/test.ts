import { createLog } from './index'
import math, {Math} from '@comark/ansi/plugins/math'
import mermaid, { Mermaid } from '@comark/ansi/plugins/mermaid'
import highlight from 'comark/plugins/highlight'


const log = createLog({
  parse: {
    plugins: [math(), highlight(), mermaid()],
  },
  render: {
    components: {
      Math,
      Mermaid,
    },
  },
  write: s => process.stderr.write(s),
})
log(`
# Hello Atinux

> [!TIP]
> This maps to \`["alert", {"type": "NOTE"}, ...]\` in the AST.

| Feature     | Status  |
| ----------- | ------- |
| Headings    | ✅      |
| Bold/Italic | ✅      |
| Code blocks | ✅      |
| Tables      | ✅      |
| Lists       | ✅      |

> [!WARNING]
> Alerts support **rich** content, \`code\`, and [links](https://example.com).

\`\`\`js [greet.js] {1,3}
function greet(name) {
  return \`Hello, \${name}!\`;
}
\`\`\`

$$
\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}
$$

\`\`\`mermaid
graph TD
  A[Start] --> B{Is it working?}
  B -->|Yes| C[Great!]
  B -->|No| D[Debug]
  D --> A
\`\`\`

`)

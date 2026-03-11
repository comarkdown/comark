import { createLog } from './index'
import math from 'comark/plugins/math'
import highlight from 'comark/plugins/highlight'

const log = createLog({
  parse: {
    plugins: [math(), highlight()],
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

`)

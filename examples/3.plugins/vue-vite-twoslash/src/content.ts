export const content = `# Twoslash for Comark

[Twoslash](https://twoslash.netlify.app) adds **interactive TypeScript annotations** to your Markdown code blocks — inline type tooltips, expected error markers, and hidden setup code — all powered by the real TypeScript compiler.

Add \`twoslash\` to any \`ts\` or \`tsx\` code fence and hover the highlighted tokens.

---

## Live Demos

### Type Hover · \`^?\`

Point an arrow at any identifier to show its inferred type in a popup:

\`\`\`ts twoslash
// @lib: es5
interface Product {
  id: string
  name: string
  price: number
}

function cheapest(items: Product[]): Product {
  return items.sort((a, b) => a.price - b.price)[0]!
}

const catalogue: Product[] = [
  { id: 'a', name: 'Pen', price: 1.5 },
  { id: 'b', name: 'Book', price: 12 },
]

const pick = cheapest(catalogue)
//    ^?

pick.name
//   ^?
\`\`\`

### Error Annotations · \`@errors\`

Document intentional type errors — great for teaching correct API usage:

\`\`\`ts twoslash
// @errors: 2322
let count: number = "not a number"
\`\`\`

\`\`\`ts twoslash
// @errors: 2345 2554
function add(a: number, b: number) {
  return a + b
}

add("one", "two")
add(1)
\`\`\`

### Hide Setup · \`// ---cut---\`

Code above the cut compiles but is hidden from readers — useful for imports and shared types:

\`\`\`ts twoslash
interface User { id: number; name: string; role: 'admin' | 'user' }
function getUser(id: number): User {
  return { id, name: 'Alice', role: 'admin' }
}
// ---cut---
const user = getUser(42)
//    ^?

user.role
//   ^?
\`\`\`

---

## Setup

### Installation

\`\`\`bash
# Server-side (Node.js, Nuxt SSR, static build)
pnpm add @shikijs/twoslash

# Browser (Vite SPA, client-side rendering)
pnpm add @shikijs/twoslash twoslash-cdn
\`\`\`

### Server-side

In a Node.js context — SSR, static site generation, or a build-time plugin — TypeScript's own file system is available, so use \`@shikijs/twoslash\` directly:

\`\`\`ts
// @lib: node
import { transformerTwoslash } from '@shikijs/twoslash'
import highlight from 'comark/plugins/highlight'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

const plugin = highlight({
  themes: { light: githubLight, dark: githubDark },
  transformers: [transformerTwoslash()],
})
\`\`\`

> **Nuxt tip** — Register the plugin inside your \`comark\` config and it runs at build time. Zero client JavaScript.

### Browser

In the browser there is no filesystem, so TypeScript cannot load its type definitions the normal way. Use \`twoslash-cdn\` to fetch them over CDN instead:

\`\`\`ts
import { createTransformerFactory, rendererRich } from '@shikijs/twoslash/core'
import { createTwoslashFromCDN } from 'twoslash-cdn'
import highlight from 'comark/plugins/highlight'
import githubLight from '@shikijs/themes/github-light'
import githubDark from '@shikijs/themes/github-dark'

// Fetch TypeScript stdlib from CDN once at startup (~500 KB)
const twoslash = createTwoslashFromCDN()
await twoslash.init()

const transformer = createTransformerFactory(twoslash.runSync)({
  explicitTrigger: true, // Do not trigger twoslash compile for code blocks without \`twoslash\` in their meta attribute
  renderer: rendererRich(),
})

const plugin = highlight({
  themes: { light: githubLight, dark: githubDark },
  transformers: [transformer],
})
\`\`\`

> **Tip** — Pass \`explicitTrigger: true\` so only code blocks tagged with \`twoslash\` in their meta string are compiled — plain \`ts\` blocks are left untouched. Pair with \`@shikijs/twoslash/style-rich.css\` for the default popup styles, then override variables to match your theme.

---

## Annotations Reference

| Annotation | Where | Effect |
|---|---|---|
| \`^?\` | After a symbol | Show inferred type in a hover popup |
| \`// @errors: N …\` | Top of block | Expect TypeScript error codes; mark others as unexpected |
| \`// @noErrors\` | Top of block | Suppress all type errors silently |
| \`// ---cut---\` | Any line | Everything above is compiled but hidden from output |
| \`// ---cut-after---\` | Any line | Everything below is compiled but hidden from output |
| \`// @filename: foo.ts\` | Top of block | Treat block as a named virtual file (for multi-file examples) |
`

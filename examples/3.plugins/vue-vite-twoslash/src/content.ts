export const content = `# Twoslash TypeScript Examples

The \`highlight\` plugin supports [Shiki Twoslash](https://shiki.style/packages/twoslash) — add \`twoslash\` to your code fence to get rich type info, error annotations, and completions directly in your docs.

## Type Inference

Use \`^?\` to show inferred types inline:

\`\`\`ts twoslash
const greeting = "Hello, World!"
//    ^?

const numbers = [1, 2, 3]
//    ^?

function add(a: number, b: number) {
  return a + b
}

const result = add(1, 2)
//    ^?
\`\`\`

## Interfaces and Generics

\`\`\`ts twoslash
interface User {
  id: number
  name: string
  email: string
}

function getUser(id: number): User {
  return { id, name: "Alice", email: "alice@example.com" }
}

const user = getUser(1)
//    ^?

user.name
//   ^?
\`\`\`

## Expected Errors

Use \`@errors\` to document type errors intentionally:

\`\`\`ts twoslash
// @errors: 2322
const count: number = "not a number"
\`\`\`

\`\`\`ts twoslash
// @errors: 2345
function double(n: number): number {
  return n * 2
}

double("oops")
\`\`\`

## Promise and Async

\`\`\`ts twoslash

async function fetchUser(id: number) {
  const response = await window.fetch(\`/api/users/\${id}\`)
  return response.json() as Promise<{ name: string; email: string }>
}

const userPromise = fetchUser(42)
//    ^?
\`\`\`

## Utility Types

\`\`\`ts twoslash
interface Config {
  host: string
  port: number
  debug: boolean
}

type ReadonlyConfig = Readonly<Config>
//   ^?

type PartialConfig = Partial<Config>
//   ^?

type ConfigKeys = keyof Config
//   ^?
\`\`\`
`

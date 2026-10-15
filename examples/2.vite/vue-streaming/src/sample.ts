/** Default markdown used to demonstrate streaming mis-renders. */
export const SAMPLE_MARKDOWN = `# Streaming demo

Hello *world* and **bold** text.

Here is a [link](https://comark.dev) mid-stream.

Inline code: \`const x = 1\`

> A blockquote with *emphasis* inside.

- item one
- item two with **nested** mark

\`\`\`ts
function greet(name: string) {
  return \`Hello, \${name}!\`
}
\`\`\`

And a trailing incomplete feel: Hello *
`

import { barplot, bench, group, run } from 'mitata'
import { createMarkdownParser } from '../packages/comark/src/parse.ts'

// Building a parser is cheap because the configured markdown-it instance is
// shared between parsers built from the same plugin functions. The two arms
// should land close together: hoisting a parser out of a render loop is no
// longer worth doing for performance.
//
// Shaped after a component documentation page: many short documents, each one a
// prop or slot description, rendered by its own component instance.
const DOCUMENTS = Array.from(
  { length: 176 },
  (_, i) => `Some **description** with \`code\` and a [link](https://example.dev) #${i}`
)

async function parseAll(parse: (markdown: string) => Promise<unknown>) {
  for (const document of DOCUMENTS) await parse(document)
}

barplot(() => {
  group('176 short documents', () => {
    bench('parser per document', async () => {
      for (const document of DOCUMENTS) await createMarkdownParser()(document)
    })

    bench('one shared parser', async () => {
      await parseAll(createMarkdownParser())
    })
  })
})

await run()

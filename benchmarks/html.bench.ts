import { test } from 'vitest'
import { createMarkdownParser } from 'comark'
import { htmlAttributesMarkdown } from './fixtures.ts'

// Raw HTML attributes are decoded by `parseHtmlAttributes`; the generic parse
// fixtures barely contain HTML, so they cannot catch changes on that path.
const parse = createMarkdownParser()
const parseLiteralHtml = createMarkdownParser({ autoClose: false })

await parse(htmlAttributesMarkdown)
await parseLiteralHtml(htmlAttributesMarkdown)

test('parse html', async ({ bench }) => {
  await bench.compare(
    bench('html attributes document', async () => {
      await parse(htmlAttributesMarkdown)
    }),
    bench('html attributes document without auto-close', async () => {
      await parseLiteralHtml(htmlAttributesMarkdown)
    })
  )
})

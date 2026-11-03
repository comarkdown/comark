import { bench, describe } from 'vitest'
import { createMarkdownParser } from 'comark'
import { renderMarkdown } from 'comark/render'
import { renderAnsiFromDocument } from '@comark/ansi'
import { renderHtmlFromDocument } from '@comark/html'
import { componentHeavyMarkdown, largeMarkdown, mediumMarkdown, smallMarkdown } from './fixtures.ts'

const parse = createMarkdownParser()

// Documents are parsed once so render benchmarks measure rendering only.
const smallDocument = await parse(smallMarkdown)
const mediumDocument = await parse(mediumMarkdown)
const largeDocument = await parse(largeMarkdown)
const componentDocument = await parse(componentHeavyMarkdown)

const ansiOptions = { colors: true, width: 80 }

await renderHtmlFromDocument(mediumDocument)
await renderAnsiFromDocument(mediumDocument, ansiOptions)
await renderMarkdown(mediumDocument)

describe('render html', () => {
  bench('small document', async () => {
    await renderHtmlFromDocument(smallDocument)
  })

  bench('medium document', async () => {
    await renderHtmlFromDocument(mediumDocument)
  })

  bench('large document', async () => {
    await renderHtmlFromDocument(largeDocument)
  })

  bench('component-heavy document', async () => {
    await renderHtmlFromDocument(componentDocument)
  })
})

describe('render ansi', () => {
  bench('medium document', async () => {
    await renderAnsiFromDocument(mediumDocument, ansiOptions)
  })

  bench('large document', async () => {
    await renderAnsiFromDocument(largeDocument, ansiOptions)
  })
})

describe('render markdown', () => {
  bench('medium document', async () => {
    await renderMarkdown(mediumDocument)
  })

  bench('large document', async () => {
    await renderMarkdown(largeDocument)
  })

  bench('component-heavy document', async () => {
    await renderMarkdown(componentDocument)
  })
})

describe('parse and render', () => {
  bench('medium document to html', async () => {
    await renderHtmlFromDocument(await parse(mediumMarkdown))
  })

  bench('large document to html', async () => {
    await renderHtmlFromDocument(await parse(largeMarkdown))
  })

  // Roundtrip used by editors and CMS integrations.
  bench('component-heavy document to markdown', async () => {
    await renderMarkdown(await parse(componentHeavyMarkdown))
  })
})

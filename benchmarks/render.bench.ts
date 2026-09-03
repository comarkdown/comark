import { bench, describe } from 'vitest'
import { createMarkdownParser } from 'comark'
import { renderMarkdown } from 'comark/render'
import { renderAnsiFromDocument } from '@comark/ansi'
import { renderHtmlFromDocument } from '../packages/comark-html/src/index.ts'
import { largeMarkdown, mediumMarkdown, smallMarkdown } from './fixtures.ts'

const parse = createMarkdownParser()

// Documents are parsed once so the benchmarks measure rendering only.
const smallDocument = await parse(smallMarkdown)
const mediumDocument = await parse(mediumMarkdown)
const largeDocument = await parse(largeMarkdown)

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
})

describe('render ansi', () => {
  bench('medium document', async () => {
    await renderAnsiFromDocument(mediumDocument, { colors: true, width: 80 })
  })

  bench('large document', async () => {
    await renderAnsiFromDocument(largeDocument, { colors: true, width: 80 })
  })
})

describe('render markdown', () => {
  bench('medium document', async () => {
    await renderMarkdown(mediumDocument)
  })

  bench('large document', async () => {
    await renderMarkdown(largeDocument)
  })
})

describe('parse and render html', () => {
  bench('medium document', async () => {
    await renderHtmlFromDocument(await parse(mediumMarkdown))
  })
})

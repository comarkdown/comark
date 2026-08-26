import { bench, describe } from 'vitest'
import { createMarkdownParser } from 'comark'
import { renderHtmlFromDocument } from '../packages/comark-html/src/index.ts'
import { componentHeavyMarkdown, largeMarkdown, mediumMarkdown, smallMarkdown } from './fixtures.ts'

const parse = createMarkdownParser()

// Pre-parse so render benches measure HTML stringify only.
const smallDoc = await parse(smallMarkdown)
const mediumDoc = await parse(mediumMarkdown)
const largeDoc = await parse(largeMarkdown)
const componentDoc = await parse(componentHeavyMarkdown)

// Warm render path once.
await renderHtmlFromDocument(mediumDoc)

describe('comark renderHtmlFromDocument', () => {
  bench('small', async () => {
    await renderHtmlFromDocument(smallDoc)
  })

  bench('medium', async () => {
    await renderHtmlFromDocument(mediumDoc)
  })

  bench('large', async () => {
    await renderHtmlFromDocument(largeDoc)
  })

  bench('component-heavy', async () => {
    await renderHtmlFromDocument(componentDoc)
  })
})

describe('comark parse + renderHtmlFromDocument', () => {
  bench('medium', async () => {
    const doc = await parse(mediumMarkdown)
    await renderHtmlFromDocument(doc)
  })

  bench('large', async () => {
    const doc = await parse(largeMarkdown)
    await renderHtmlFromDocument(doc)
  })
})

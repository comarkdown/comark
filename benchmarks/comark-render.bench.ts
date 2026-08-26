import { bench, describe } from 'vitest'
import { createMarkdownParser } from 'comark'
import { renderMarkdown } from 'comark/render'
import { renderHtmlFromDocument } from '../packages/comark-html/src/index.ts'
import { componentHeavyMarkdown, largeMarkdown, mediumMarkdown, smallMarkdown } from './fixtures.ts'

const parse = createMarkdownParser()

// Pre-parse so render-only benches measure stringify, not parse.
const smallDoc = await parse(smallMarkdown)
const mediumDoc = await parse(mediumMarkdown)
const largeDoc = await parse(largeMarkdown)
const componentDoc = await parse(componentHeavyMarkdown)

// Warm both render paths once.
await renderHtmlFromDocument(mediumDoc)
await renderMarkdown(mediumDoc)

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

describe('comark renderMarkdown', () => {
  bench('small', async () => {
    await renderMarkdown(smallDoc)
  })

  bench('medium', async () => {
    await renderMarkdown(mediumDoc)
  })

  bench('large', async () => {
    await renderMarkdown(largeDoc)
  })

  bench('component-heavy', async () => {
    await renderMarkdown(componentDoc)
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

describe('comark parse + renderMarkdown', () => {
  bench('medium', async () => {
    const doc = await parse(mediumMarkdown)
    await renderMarkdown(doc)
  })

  bench('large', async () => {
    const doc = await parse(largeMarkdown)
    await renderMarkdown(doc)
  })

  bench('component-heavy', async () => {
    const doc = await parse(componentHeavyMarkdown)
    await renderMarkdown(doc)
  })
})

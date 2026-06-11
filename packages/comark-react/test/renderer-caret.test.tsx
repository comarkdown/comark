import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { parse } from 'comark'
import { ComarkRenderer } from '../src/components/ComarkRenderer'

const countCarets = (html: string) => html.split('animation:comark-caret-pulse').length - 1

describe('ComarkRenderer streaming caret', () => {
  it('appends a single caret when streaming', async () => {
    const tree = await parse('Hello world', { streaming: true })
    const html = renderToString(<ComarkRenderer tree={tree} streaming caret />)
    expect(countCarets(html)).toBe(1)
  })

  it('does not mutate the input tree', async () => {
    const tree = await parse('Hello world', { streaming: true })
    const before = JSON.stringify(tree.nodes)
    renderToString(<ComarkRenderer tree={tree} streaming caret />)
    expect(JSON.stringify(tree.nodes)).toBe(before)
  })

  it('does not accumulate carets across repeated renders of the same tree', async () => {
    // Streaming reuses node objects across parses; rendering the same tree
    // twice must not stack carets (regression for the "three dots" bug).
    const tree = await parse('Hello world', { streaming: true })
    renderToString(<ComarkRenderer tree={tree} streaming caret />)
    const second = renderToString(<ComarkRenderer tree={tree} streaming caret />)
    expect(countCarets(second)).toBe(1)
  })

  it('renders no caret when not streaming', async () => {
    const tree = await parse('Hello world', { streaming: true })
    const html = renderToString(<ComarkRenderer tree={tree} streaming={false} caret />)
    expect(countCarets(html)).toBe(0)
  })
})

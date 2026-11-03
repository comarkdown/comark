import { describe, expect, it } from 'vitest'
import { render } from 'vitest-browser-svelte'
import Markdown from '../src/components/Markdown.svelte'

describe('root element attributes (browser)', () => {
  it('Markdown sets them on the root element after parsing a string', async () => {
    const screen = await render(Markdown, {
      value: 'Hello **world**',
      class: 'custom',
      id: 'answer',
      'data-testid': 'answer',
      'aria-label': 'Assistant reply',
      'aria-busy': true,
    })

    await expect.element(screen.getByTestId('answer')).toBeInTheDocument()
    const root = screen.container.querySelector('.comark-content')!
    expect(root.getAttribute('id')).toBe('answer')
    expect(root.getAttribute('aria-label')).toBe('Assistant reply')
    expect(root.getAttribute('aria-busy')).toBe('true')
    expect(root.className).toBe('comark-content custom')
    expect(root.textContent).toContain('Hello world')
  })

  it('updates them when the props change', async () => {
    const screen = await render(Markdown, { value: 'Hello', streaming: true, 'aria-busy': true })
    await expect.element(screen.getByText('Hello')).toBeInTheDocument()
    const root = screen.container.querySelector('.comark-content')!
    expect(root.getAttribute('aria-busy')).toBe('true')

    await screen.rerender({ value: 'Hello', streaming: false, 'aria-busy': false })
    await expect.poll(() => root.getAttribute('aria-busy')).toBe('false')
  })
})

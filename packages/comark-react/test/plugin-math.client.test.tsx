// @vitest-environment happy-dom
import { StrictMode, act } from 'react'
import { createRoot } from 'react-dom/client'
import { expect, it, vi } from 'vitest'

;(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true

it('shows the TeX source and stops loading KaTeX after a failed load in StrictMode', async () => {
  let attempts = 0
  vi.doMock('katex', () => {
    attempts++
    throw new Error('Failed to fetch dynamically imported module')
  })
  const { Math } = await import('../src/plugins/math')
  const container = document.createElement('div')
  const root = createRoot(container)

  await act(async () => {
    root.render(
      <StrictMode>
        <Math
          content="x^2"
          className="math inline"
        />
      </StrictMode>
    )
  })
  await act(() => new Promise((resolve) => setTimeout(resolve, 100)))

  expect(container.innerHTML).toBe('<span class="math inline">x^2</span>')
  expect(attempts).toBe(1)

  act(() => root.unmount())
  vi.doUnmock('katex')
})

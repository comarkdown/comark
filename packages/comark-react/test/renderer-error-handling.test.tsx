import { describe, expect, it, vi } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { parse } from 'comark'
import { ComarkRenderer } from '../src/components/ComarkRenderer'

describe('ComarkRenderer Error Handling', () => {
  it('should render successfully with valid components', async () => {
    const markdown = `::good-component
Some content
::`

    const result = await parse(markdown)

    function GoodComponent({ children }: any) {
      return <div className="good-component">{children}</div>
    }

    const html = renderToString(
      <ComarkRenderer
        tree={result}
        components={{ 'good-component': GoodComponent }}
      />
    )

    expect(html).toContain('comark-content')
    expect(html).toContain('good-component')
    expect(html).toContain('Some content')
  })

  it('should propagate component errors during SSR', async () => {
    // Unlike Vue (which has onErrorCaptured), React's renderToString surfaces
    // errors synchronously. Wrap with renderToPipeableStream for error isolation.
    const markdown = `::error-component
Some content
::`

    const result = await parse(markdown)

    function ErrorComponent() {
      throw new Error('Component error during render')
      return null
    }

    const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

    try {
      expect(() =>
        renderToString(
          <ComarkRenderer
            tree={result}
            components={{ 'error-component': ErrorComponent }}
          />
        )
      ).toThrow('Component error during render')
    } finally {
      errSpy.mockRestore()
    }
  })

  it('should render valid components when an unknown tag has no registered component', async () => {
    // Unknown tags fall back to native HTML elements, not errors
    const markdown = `::error-component
Error content
::

## Working Heading

::good-component
Good content
::`

    const result = await parse(markdown)

    function GoodComponent({ children }: any) {
      return <div className="good-component">{children}</div>
    }

    // Only register good-component; error-component falls back to a native element
    const html = renderToString(
      <ComarkRenderer
        tree={result}
        components={{ 'good-component': GoodComponent }}
      />
    )

    expect(html).toContain('Working Heading')
    expect(html).toContain('good-component')
    expect(html).toContain('Good content')
  })

  it('should render an empty tree without errors', async () => {
    const result = await parse('')

    const html = renderToString(<ComarkRenderer tree={result} />)

    expect(html).toContain('comark-content')
  })
})

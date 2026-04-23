import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { parse } from 'comark'
import { ComarkRenderer } from '../src/components/ComarkRenderer'

describe('ComarkRenderer with Slots', () => {
  it('should pass named slots to components as props', async () => {
    const markdown = `::test-component
Default content

#header
Header content

#footer
Footer content
::`

    const result = await parse(markdown)

    // In React, named slots become props: slotHeader, slotFooter
    // Default slot becomes children
    function TestComponent({ children, slotHeader, slotFooter }: any) {
      return (
        <div className="test-component">
          <header>{slotHeader}</header>
          <main>{children}</main>
          <footer>{slotFooter}</footer>
        </div>
      )
    }

    const html = renderToString(
      <ComarkRenderer
        tree={result}
        components={{ 'test-component': TestComponent }}
      />
    )

    expect(html).toContain('test-component')
    expect(html).toContain('Header content')
    expect(html).toContain('Default content')
    expect(html).toContain('Footer content')

    // Verify structure: header before main, main before footer
    const headerIndex = html.indexOf('Header content')
    const defaultIndex = html.indexOf('Default content')
    const footerIndex = html.indexOf('Footer content')

    expect(headerIndex).toBeLessThan(defaultIndex)
    expect(defaultIndex).toBeLessThan(footerIndex)
  })

  it('should handle component with only named slots (no default)', async () => {
    const markdown = `::callout
#title
Warning Title
#description
This is a description
::`

    const result = await parse(markdown)

    function Callout({ slotTitle, slotDescription }: any) {
      return (
        <div className="callout">
          <h3>{slotTitle}</h3>
          <p>{slotDescription}</p>
        </div>
      )
    }

    const html = renderToString(
      <ComarkRenderer
        tree={result}
        components={{ Callout }}
      />
    )

    expect(html).toContain('Warning Title')
    expect(html).toContain('This is a description')
  })

  it('should handle component with mix of default and named slots', async () => {
    const markdown = `::multi-slot-test
**This is default content**

#header
This is header part

#footer
Copyright by Nuxt
::`

    const result = await parse(markdown)

    function MultiSlotTest({ children, slotHeader, slotFooter }: any) {
      return (
        <div className="multi-slot">
          <div className="slot-header">{slotHeader}</div>
          <div className="slot-default">{children}</div>
          <div className="slot-footer">{slotFooter}</div>
        </div>
      )
    }

    const html = renderToString(
      <ComarkRenderer
        tree={result}
        components={{ 'multi-slot-test': MultiSlotTest }}
      />
    )

    expect(html).toContain('This is default content')
    expect(html).toContain('This is header part')
    expect(html).toContain('Copyright by Nuxt')

    expect(html).toContain('slot-header')
    expect(html).toContain('slot-default')
    expect(html).toContain('slot-footer')
  })
})

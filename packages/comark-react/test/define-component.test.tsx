import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToReadableStream } from 'react-dom/server'
import { parse } from 'comark'
import emoji from 'comark/plugins/emoji'
import { defineComarkComponent, defineComarkRendererComponent } from '../src/index'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function renderAsync(element: React.ReactElement): Promise<string> {
  const stream = await renderToReadableStream(element)
  await stream.allReady
  return new Response(stream).text()
}

function makeAlert(className: string): React.FC<{ children?: React.ReactNode }> {
  function Alert({ children }: { children?: React.ReactNode }) {
    return <div className={className}>{children}</div>
  }
  Alert.displayName = `Alert_${className}`
  return Alert
}

const AlertBase = makeAlert('alert-base')
const AlertChild = makeAlert('alert-child')
const AlertProp = makeAlert('alert-prop')

const CardBase = makeAlert('card-base')

// ---------------------------------------------------------------------------
// defineComarkComponent
// ---------------------------------------------------------------------------

describe('defineComarkComponent — component inheritance via extends', () => {
  it('child inherits parent components when none of its own are defined', async () => {
    const Base = defineComarkComponent({ name: 'Base', components: { alert: AlertBase } })
    const Child = defineComarkComponent({ name: 'Child', extends: Base })

    const html = await renderAsync(<Child markdown="::alert&#10;hello&#10;::" />)

    expect(html).toContain('alert-base')
  })

  it('child components override the same tag from parent', async () => {
    const Base = defineComarkComponent({ name: 'Base', components: { alert: AlertBase } })
    const Child = defineComarkComponent({ name: 'Child', extends: Base, components: { alert: AlertChild } })

    const html = await renderAsync(<Child markdown={'::alert\nhello\n::'} />)

    expect(html).toContain('alert-child')
    expect(html).not.toContain('alert-base')
  })

  it('child keeps parent components that it does not override', async () => {
    const Base = defineComarkComponent({ name: 'Base', components: { alert: AlertBase, card: CardBase } })
    const Child = defineComarkComponent({ name: 'Child', extends: Base, components: { alert: AlertChild } })

    const html = await renderAsync(<Child markdown={'::alert\nA\n::\n\n::card\nB\n::'} />)

    expect(html).toContain('alert-child')
    expect(html).toContain('card-base')
  })

  it('prop-level components override child and parent config', async () => {
    const Base = defineComarkComponent({ name: 'Base', components: { alert: AlertBase } })
    const Child = defineComarkComponent({ name: 'Child', extends: Base, components: { alert: AlertChild } })

    const html = await renderAsync(
      <Child markdown={'::alert\nhello\n::'} components={{ alert: AlertProp }} />,
    )

    expect(html).toContain('alert-prop')
    expect(html).not.toContain('alert-child')
    expect(html).not.toContain('alert-base')
  })
})

describe('defineComarkComponent — plugin inheritance via extends', () => {
  it('child inherits parent plugins', async () => {
    const Base = defineComarkComponent({ name: 'Base', plugins: [emoji()] })
    const Child = defineComarkComponent({ name: 'Child', extends: Base })

    const html = await renderAsync(<Child markdown=":smile:" />)

    expect(html).toContain('😄')
  })

  it('parent and child plugins both run', async () => {
    const Base = defineComarkComponent({ name: 'Base', plugins: [emoji()] })
    const Child = defineComarkComponent({ name: 'Child', extends: Base })

    const html = await renderAsync(<Child markdown=":smile: :heart:" />)

    expect(html).toContain('😄')
    expect(html).toContain('❤️')
  })

  it('prop plugins are appended after config plugins', async () => {
    const Base = defineComarkComponent({ name: 'Base', plugins: [emoji()] })
    const Child = defineComarkComponent({ name: 'Child', extends: Base })

    const html = await renderAsync(<Child markdown=":smile:" plugins={[emoji()]} />)

    expect(html).toContain('😄')
  })

  it('multi-level extends stacks plugins correctly', async () => {
    const Base = defineComarkComponent({ name: 'Base', plugins: [emoji()] })
    const Middle = defineComarkComponent({ name: 'Middle', extends: Base })
    const Child = defineComarkComponent({ name: 'Child', extends: Middle })

    const html = await renderAsync(<Child markdown=":smile: :heart:" />)

    expect(html).toContain('😄')
    expect(html).toContain('❤️')
  })
})

// ---------------------------------------------------------------------------
// defineComarkComponent — className
// ---------------------------------------------------------------------------

describe('defineComarkComponent — className via config', () => {
  it('applies config className to wrapper div', async () => {
    const Custom = defineComarkComponent({ name: 'WithClass', className: 'prose dark' })
    const html = await renderAsync(<Custom markdown="hello" />)
    expect(html).toContain('comark-content prose dark')
  })

  it('merges config className with prop className', async () => {
    const Custom = defineComarkComponent({ name: 'WithClass', className: 'prose' })
    const html = await renderAsync(<Custom markdown="hello" className="extra" />)
    expect(html).toContain('prose extra')
  })

  it('prop className works without config className', async () => {
    const Custom = defineComarkComponent({ name: 'NoConfigClass' })
    const html = await renderAsync(<Custom markdown="hello" className="only-prop" />)
    expect(html).toContain('comark-content only-prop')
  })

  it('inherited component preserves parent className', async () => {
    const Base = defineComarkComponent({ name: 'Base', className: 'base-class' })
    const Child = defineComarkComponent({ name: 'Child', extends: Base })
    const html = await renderAsync(<Child markdown="hello" />)
    expect(html).toContain('base-class')
  })
})

// ---------------------------------------------------------------------------
// defineComarkRendererComponent
// ---------------------------------------------------------------------------

describe('defineComarkRendererComponent — component inheritance via extends', () => {
  it('renders with config components', async () => {
    const Renderer = defineComarkRendererComponent({
      name: 'TestRenderer',
      components: { alert: AlertBase },
    })
    const tree = await parse('::alert\nhello\n::')
    const html = await renderAsync(<Renderer tree={tree} />)

    expect(html).toContain('alert-base')
  })

  it('child inherits parent components when none of its own are defined', async () => {
    const Base = defineComarkRendererComponent({ name: 'BaseRenderer', components: { alert: AlertBase } })
    const Child = defineComarkRendererComponent({ name: 'ChildRenderer', extends: Base })

    const tree = await parse('::alert\nhello\n::')
    const html = await renderAsync(<Child tree={tree} />)

    expect(html).toContain('alert-base')
  })

  it('child components override the same tag from parent', async () => {
    const Base = defineComarkRendererComponent({ name: 'BaseRenderer', components: { alert: AlertBase } })
    const Child = defineComarkRendererComponent({ name: 'ChildRenderer', extends: Base, components: { alert: AlertChild } })

    const tree = await parse('::alert\nhello\n::')
    const html = await renderAsync(<Child tree={tree} />)

    expect(html).toContain('alert-child')
    expect(html).not.toContain('alert-base')
  })

  it('child keeps parent components that it does not override', async () => {
    const Base = defineComarkRendererComponent({ name: 'BaseRenderer', components: { alert: AlertBase, card: CardBase } })
    const Child = defineComarkRendererComponent({ name: 'ChildRenderer', extends: Base, components: { alert: AlertChild } })

    const tree = await parse('::alert\nA\n::\n\n::card\nB\n::')
    const html = await renderAsync(<Child tree={tree} />)

    expect(html).toContain('alert-child')
    expect(html).toContain('card-base')
  })

  it('prop-level components override child and parent config', async () => {
    const Base = defineComarkRendererComponent({ name: 'BaseRenderer', components: { alert: AlertBase } })
    const Child = defineComarkRendererComponent({ name: 'ChildRenderer', extends: Base, components: { alert: AlertChild } })

    const tree = await parse('::alert\nhello\n::')
    const html = await renderAsync(<Child tree={tree} components={{ alert: AlertProp }} />)

    expect(html).toContain('alert-prop')
    expect(html).not.toContain('alert-child')
    expect(html).not.toContain('alert-base')
  })

  it('multi-level extends stacks component maps correctly', async () => {
    const Base = defineComarkRendererComponent({ name: 'BaseRenderer', components: { alert: AlertBase, card: CardBase } })
    const Middle = defineComarkRendererComponent({ name: 'MiddleRenderer', extends: Base, components: { alert: AlertChild } })
    const Child = defineComarkRendererComponent({ name: 'ChildRenderer', extends: Middle })

    const tree = await parse('::alert\nA\n::\n\n::card\nB\n::')
    const html = await renderAsync(<Child tree={tree} />)

    expect(html).toContain('alert-child')
    expect(html).toContain('card-base')
  })
})

// ---------------------------------------------------------------------------
// defineComarkRendererComponent — className
// ---------------------------------------------------------------------------

describe('defineComarkRendererComponent — className via config', () => {
  it('applies config className to wrapper div', async () => {
    const Renderer = defineComarkRendererComponent({ name: 'WithClass', className: 'prose dark' })
    const tree = await parse('hello')
    const html = await renderAsync(<Renderer tree={tree} />)
    expect(html).toContain('comark-content prose dark')
  })

  it('merges config className with prop className', async () => {
    const Renderer = defineComarkRendererComponent({ name: 'WithClass', className: 'prose' })
    const tree = await parse('hello')
    const html = await renderAsync(<Renderer tree={tree} className="extra" />)
    expect(html).toContain('prose extra')
  })

  it('prop className works without config className', async () => {
    const Renderer = defineComarkRendererComponent({ name: 'NoConfigClass' })
    const tree = await parse('hello')
    const html = await renderAsync(<Renderer tree={tree} className="only-prop" />)
    expect(html).toContain('comark-content only-prop')
  })

  it('inherited renderer preserves parent className', async () => {
    const Base = defineComarkRendererComponent({ name: 'BaseRenderer', className: 'base-class' })
    const Child = defineComarkRendererComponent({ name: 'ChildRenderer', extends: Base, className: 'child-class' })
    const tree = await parse('hello')
    const html = await renderAsync(<Child tree={tree} />)
    expect(html).toContain('base-class')
    expect(html).toContain('child-class')
  })
})

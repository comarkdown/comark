import { describe, expect, it } from 'vitest'
import React from 'react'
import { renderToReadableStream } from 'react-dom/server'
import { parse } from 'comark'
import emoji from 'comark/plugins/emoji'
import { defineMarkdownComponent, defineMarkdownDocumentComponent } from '../src/index'

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
// defineMarkdownComponent
// ---------------------------------------------------------------------------

describe('defineMarkdownComponent — component inheritance via extends', () => {
  it('child inherits parent components when none of its own are defined', async () => {
    const Base = defineMarkdownComponent({ name: 'Base', components: { alert: AlertBase } })
    const Child = defineMarkdownComponent({ name: 'Child', extends: Base })

    const html = await renderAsync(<Child value="::alert&#10;hello&#10;::" />)

    expect(html).toContain('alert-base')
  })

  it('child components override the same tag from parent', async () => {
    const Base = defineMarkdownComponent({ name: 'Base', components: { alert: AlertBase } })
    const Child = defineMarkdownComponent({ name: 'Child', extends: Base, components: { alert: AlertChild } })

    const html = await renderAsync(<Child value={'::alert\nhello\n::'} />)

    expect(html).toContain('alert-child')
    expect(html).not.toContain('alert-base')
  })

  it('child keeps parent components that it does not override', async () => {
    const Base = defineMarkdownComponent({ name: 'Base', components: { alert: AlertBase, card: CardBase } })
    const Child = defineMarkdownComponent({ name: 'Child', extends: Base, components: { alert: AlertChild } })

    const html = await renderAsync(<Child value={'::alert\nA\n::\n\n::card\nB\n::'} />)

    expect(html).toContain('alert-child')
    expect(html).toContain('card-base')
  })

  it('prop-level components override child and parent config', async () => {
    const Base = defineMarkdownComponent({ name: 'Base', components: { alert: AlertBase } })
    const Child = defineMarkdownComponent({ name: 'Child', extends: Base, components: { alert: AlertChild } })

    const html = await renderAsync(
      <Child
        value={'::alert\nhello\n::'}
        components={{ alert: AlertProp }}
      />
    )

    expect(html).toContain('alert-prop')
    expect(html).not.toContain('alert-child')
    expect(html).not.toContain('alert-base')
  })
})

describe('defineMarkdownComponent — plugin inheritance via extends', () => {
  it('child inherits parent plugins', async () => {
    const Base = defineMarkdownComponent({ name: 'Base', plugins: [emoji()] })
    const Child = defineMarkdownComponent({ name: 'Child', extends: Base })

    const html = await renderAsync(<Child value=":smile:" />)

    expect(html).toContain('😄')
  })

  it('parent and child plugins both run', async () => {
    const Base = defineMarkdownComponent({ name: 'Base', plugins: [emoji()] })
    const Child = defineMarkdownComponent({ name: 'Child', extends: Base })

    const html = await renderAsync(<Child value=":smile: :heart:" />)

    expect(html).toContain('😄')
    expect(html).toContain('❤️')
  })

  it('prop plugins are appended after config plugins', async () => {
    const Base = defineMarkdownComponent({ name: 'Base', plugins: [emoji()] })
    const Child = defineMarkdownComponent({ name: 'Child', extends: Base })

    const html = await renderAsync(
      <Child
        value=":smile:"
        plugins={[emoji()]}
      />
    )

    expect(html).toContain('😄')
  })

  it('multi-level extends stacks plugins correctly', async () => {
    const Base = defineMarkdownComponent({ name: 'Base', plugins: [emoji()] })
    const Middle = defineMarkdownComponent({ name: 'Middle', extends: Base })
    const Child = defineMarkdownComponent({ name: 'Child', extends: Middle })

    const html = await renderAsync(<Child value=":smile: :heart:" />)

    expect(html).toContain('😄')
    expect(html).toContain('❤️')
  })
})

// ---------------------------------------------------------------------------
// defineMarkdownComponent — className
// ---------------------------------------------------------------------------

describe('defineMarkdownComponent — className via config', () => {
  it('applies config className to wrapper div', async () => {
    const Custom = defineMarkdownComponent({ name: 'WithClass', className: 'prose dark' })
    const html = await renderAsync(<Custom value="hello" />)
    expect(html).toContain('comark-content prose dark')
  })

  it('merges config className with prop className', async () => {
    const Custom = defineMarkdownComponent({ name: 'WithClass', className: 'prose' })
    const html = await renderAsync(
      <Custom
        value="hello"
        className="extra"
      />
    )
    expect(html).toContain('prose extra')
  })

  it('prop className works without config className', async () => {
    const Custom = defineMarkdownComponent({ name: 'NoConfigClass' })
    const html = await renderAsync(
      <Custom
        value="hello"
        className="only-prop"
      />
    )
    expect(html).toContain('comark-content only-prop')
  })

  it('inherited component preserves parent className', async () => {
    const Base = defineMarkdownComponent({ name: 'Base', className: 'base-class' })
    const Child = defineMarkdownComponent({ name: 'Child', extends: Base })
    const html = await renderAsync(<Child value="hello" />)
    expect(html).toContain('base-class')
  })
})

// ---------------------------------------------------------------------------
// defineMarkdownDocumentComponent
// ---------------------------------------------------------------------------

describe('defineMarkdownDocumentComponent — component inheritance via extends', () => {
  it('renders with config components', async () => {
    const Renderer = defineMarkdownDocumentComponent({
      name: 'TestRenderer',
      components: { alert: AlertBase },
    })
    const tree = await parse('::alert\nhello\n::')
    const html = await renderAsync(<Renderer value={tree} />)

    expect(html).toContain('alert-base')
  })

  it('child inherits parent components when none of its own are defined', async () => {
    const Base = defineMarkdownDocumentComponent({ name: 'BaseRenderer', components: { alert: AlertBase } })
    const Child = defineMarkdownDocumentComponent({ name: 'ChildRenderer', extends: Base })

    const tree = await parse('::alert\nhello\n::')
    const html = await renderAsync(<Child value={tree} />)

    expect(html).toContain('alert-base')
  })

  it('child components override the same tag from parent', async () => {
    const Base = defineMarkdownDocumentComponent({ name: 'BaseRenderer', components: { alert: AlertBase } })
    const Child = defineMarkdownDocumentComponent({
      name: 'ChildRenderer',
      extends: Base,
      components: { alert: AlertChild },
    })

    const tree = await parse('::alert\nhello\n::')
    const html = await renderAsync(<Child value={tree} />)

    expect(html).toContain('alert-child')
    expect(html).not.toContain('alert-base')
  })

  it('child keeps parent components that it does not override', async () => {
    const Base = defineMarkdownDocumentComponent({
      name: 'BaseRenderer',
      components: { alert: AlertBase, card: CardBase },
    })
    const Child = defineMarkdownDocumentComponent({
      name: 'ChildRenderer',
      extends: Base,
      components: { alert: AlertChild },
    })

    const tree = await parse('::alert\nA\n::\n\n::card\nB\n::')
    const html = await renderAsync(<Child value={tree} />)

    expect(html).toContain('alert-child')
    expect(html).toContain('card-base')
  })

  it('prop-level components override child and parent config', async () => {
    const Base = defineMarkdownDocumentComponent({ name: 'BaseRenderer', components: { alert: AlertBase } })
    const Child = defineMarkdownDocumentComponent({
      name: 'ChildRenderer',
      extends: Base,
      components: { alert: AlertChild },
    })

    const tree = await parse('::alert\nhello\n::')
    const html = await renderAsync(
      <Child
        value={tree}
        components={{ alert: AlertProp }}
      />
    )

    expect(html).toContain('alert-prop')
    expect(html).not.toContain('alert-child')
    expect(html).not.toContain('alert-base')
  })

  it('multi-level extends stacks component maps correctly', async () => {
    const Base = defineMarkdownDocumentComponent({
      name: 'BaseRenderer',
      components: { alert: AlertBase, card: CardBase },
    })
    const Middle = defineMarkdownDocumentComponent({
      name: 'MiddleRenderer',
      extends: Base,
      components: { alert: AlertChild },
    })
    const Child = defineMarkdownDocumentComponent({ name: 'ChildRenderer', extends: Middle })

    const tree = await parse('::alert\nA\n::\n\n::card\nB\n::')
    const html = await renderAsync(<Child value={tree} />)

    expect(html).toContain('alert-child')
    expect(html).toContain('card-base')
  })
})

// ---------------------------------------------------------------------------
// defineMarkdownDocumentComponent — className
// ---------------------------------------------------------------------------

describe('defineMarkdownDocumentComponent — className via config', () => {
  it('applies config className to wrapper div', async () => {
    const Renderer = defineMarkdownDocumentComponent({ name: 'WithClass', className: 'prose dark' })
    const tree = await parse('hello')
    const html = await renderAsync(<Renderer value={tree} />)
    expect(html).toContain('comark-content prose dark')
  })

  it('merges config className with prop className', async () => {
    const Renderer = defineMarkdownDocumentComponent({ name: 'WithClass', className: 'prose' })
    const tree = await parse('hello')
    const html = await renderAsync(
      <Renderer
        value={tree}
        className="extra"
      />
    )
    expect(html).toContain('prose extra')
  })

  it('prop className works without config className', async () => {
    const Renderer = defineMarkdownDocumentComponent({ name: 'NoConfigClass' })
    const tree = await parse('hello')
    const html = await renderAsync(
      <Renderer
        value={tree}
        className="only-prop"
      />
    )
    expect(html).toContain('comark-content only-prop')
  })

  it('inherited renderer preserves parent className', async () => {
    const Base = defineMarkdownDocumentComponent({ name: 'BaseRenderer', className: 'base-class' })
    const Child = defineMarkdownDocumentComponent({ name: 'ChildRenderer', extends: Base, className: 'child-class' })
    const tree = await parse('hello')
    const html = await renderAsync(<Child value={tree} />)
    expect(html).toContain('base-class')
    expect(html).toContain('child-class')
  })
})

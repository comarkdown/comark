import '@angular/compiler'
import { describe, expect, it, vi } from 'vitest'
import { Component, provideZonelessChangeDetection, type Type } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { renderApplication } from '@angular/platform-server'
import { parseMarkdown, type MarkdownDocument as MarkdownDocumentType } from 'comark'
import { MarkdownDocument } from '../src/components/markdown-document.component.ts'
import { MarkdownNode } from '../src/components/markdown-node.component.ts'

function createRenderer() {
  return {
    createText: (value: string) => ({ value }),
    appendChild: vi.fn(),
  }
}

function createNode(overrides: Record<string, unknown> = {}) {
  const node = Object.create(MarkdownNode.prototype) as any
  Object.assign(node, {
    node: ['root', {}],
    components: { Badge: class Badge {} },
    renderer: createRenderer(),
    vcr: { createComponent: vi.fn() },
    ...overrides,
  })
  return node
}

describe('MarkdownNode nested component rendering', () => {
  it('passes nested inputs through Angular input binding', () => {
    const componentRef = {
      setInput: vi.fn(),
      changeDetectorRef: { detectChanges: vi.fn() },
      location: { nativeElement: { style: {} } },
    }
    const node = createNode({
      vcr: { createComponent: vi.fn(() => componentRef) },
    })

    node.renderChildren({}, [['badge', {}, 'shown']], { frontmatter: {}, meta: {}, data: {}, props: {} })

    expect(componentRef.setInput).toHaveBeenCalledWith('node', ['badge', {}, 'shown'])
    expect(componentRef.setInput).toHaveBeenCalledWith('components', node.components)
    expect(componentRef.setInput).toHaveBeenCalledWith('parent', node.node)
    expect(componentRef.changeDetectorRef.detectChanges).toHaveBeenCalledOnce()
  })

  it('logs a failed custom component and continues with later siblings', () => {
    const error = new Error('constructor failed')
    const renderer = createRenderer()
    const node = createNode({
      renderer,
      vcr: {
        createComponent: vi.fn(() => {
          throw error
        }),
      },
    })
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    node.renderChildren({}, [['badge', {}, 'gone'], 'still rendered'], {
      frontmatter: {},
      meta: {},
      data: {},
      props: {},
    })

    expect(consoleError).toHaveBeenCalledWith('Failed to render custom component "badge"', error)
    expect(renderer.appendChild).toHaveBeenCalledWith({}, { value: 'still rendered' })
    consoleError.mockRestore()
  })
})

/** Badge — applied via decorator factory so Vitest/oxc need not enable experimentalDecorators. */
class Badge {
  name = 'badge'
}
Component({
  selector: 'app-badge',
  standalone: true,
  template: `<span class="badge">{{ name }}</span>`,
  inputs: ['name'],
})(Badge)

async function renderMarkdown(
  markdown: string,
  components: Record<string, Type<unknown>> = { badge: Badge as Type<unknown> }
): Promise<string> {
  const document = await parseMarkdown(markdown)

  class App {
    document: MarkdownDocumentType = document
    components = components
  }
  Component({
    selector: 'app-root',
    standalone: true,
    imports: [MarkdownDocument],
    template: `
      <comark-markdown-document
        [value]="document"
        [components]="components"
      />
    `,
  })(App)

  return renderApplication(
    (context) =>
      bootstrapApplication(
        App,
        {
          providers: [provideZonelessChangeDetection()],
        },
        context
      ),
    {
      document: '<!DOCTYPE html><html><head></head><body><app-root></app-root></body></html>',
    }
  )
}

describe('nested components', () => {
  it('renders Badge component name for inline :badge', async () => {
    const html = await renderMarkdown('Hello :badge')

    expect(html).toContain('class="badge"')
    expect(html).toContain('>badge</span>')
  })
  it('renders Badge component name for inline :badge with custom name', async () => {
    const html = await renderMarkdown('Hello :badge{name="Ahad"}')

    expect(html).toContain('class="badge"')
    expect(html).toContain('>Ahad</span>')
  })
})

/** ProsePre — a custom code block that wraps the rendered `<pre>`. */
class ProsePre {}
Component({
  selector: 'app-prose-pre',
  standalone: true,
  template: `<div class="prose-pre"><ng-content /></div>`,
})(ProsePre)

/** Box — a block component that projects its children. */
class Box {}
Component({
  selector: 'app-box',
  standalone: true,
  template: `<div class="box"><ng-content /></div>`,
})(Box)

describe('nested component placement', () => {
  it('keeps an inline component inside its paragraph, between the surrounding text', async () => {
    const html = await renderMarkdown('Before :badge{name="x"} after.')

    expect(html).toMatch(/<p>Before .*<span class="badge">x<\/span>.* after\.<\/p>/)
  })

  it('keeps a custom code block inside its list item', async () => {
    const html = await renderMarkdown('- item\n\n  ```js\n  code\n  ```\n', {
      ProsePre: ProsePre as Type<unknown>,
    })

    expect(html).toMatch(/<li>.*<div class="prose-pre">.*code.*<\/div>.*<\/li>/s)
  })

  it('keeps a nested block component inside its parent component', async () => {
    const html = await renderMarkdown('::box\nOuter\n  :::box\n  Inner\n  :::\n::\n', { box: Box as Type<unknown> })

    expect(html).toMatch(/<div class="box"><p>Outer<\/p>.*<div class="box">Inner<\/div>.*<\/div>/s)
  })
})

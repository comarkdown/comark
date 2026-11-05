import '@angular/compiler'
import { describe, expect, it } from 'vitest'
import { Component, provideZonelessChangeDetection, type Type } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { renderApplication } from '@angular/platform-server'
import { parseMarkdown, type MarkdownDocument as MarkdownDocumentType, type NodeTransform } from 'comark'
import { MarkdownDocument } from '../src/components/markdown-document.component.ts'

class Probe {
  text = ''
}
Component({
  selector: 'app-probe',
  standalone: true,
  inputs: ['text'],
  template: '<i class="probe">[{{ text }}]</i>',
})(Probe)

async function renderMarkdown(markdown: string, transformNode: NodeTransform): Promise<string> {
  const document = await parseMarkdown(markdown)
  const components: Record<string, Type<unknown>> = { probe: Probe as Type<unknown> }

  class App {
    document: MarkdownDocumentType = document
    components = components
    transformNode = transformNode
  }
  Component({
    selector: 'app-root',
    standalone: true,
    imports: [MarkdownDocument],
    template: `
      <comark-markdown-document
        [value]="document"
        [components]="components"
        [transformNode]="transformNode"
      />
    `,
  })(App)

  return renderApplication(
    (context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!DOCTYPE html><html><head></head><body><app-root></app-root></body></html>' }
  )
}

describe('MarkdownDocument — transformNode', () => {
  it('swaps a nested native node for a component with new props', async () => {
    const html = await renderMarkdown('::div\nHello :span{data-x="Ada"}\n::', ({ tag, props }) =>
      tag === 'span' ? { tag: 'probe', props: { text: `${props['data-x']}!` } } : undefined
    )
    expect(html).toContain('[Ada!]')
  })

  it('changes a native tag and gives children the transformed props', async () => {
    const html = await renderMarkdown('::div{label="Raw"}\n:probe{:text="props.label"}\n::', ({ tag, props }) =>
      tag === 'div' ? { tag: 'section', props: { ...props, label: 'Changed' } } : undefined
    )
    expect(html).toContain('<section label="Changed">')
    expect(html).toContain('[Changed]')
  })
})

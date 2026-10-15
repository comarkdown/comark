import '@angular/compiler'
import { describe, expect, it } from 'vitest'
import { Component, provideZonelessChangeDetection, type Type } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { renderApplication } from '@angular/platform-server'
import { parseMarkdown, type MarkdownDocument as MarkdownDocumentType } from 'comark'
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

async function renderMarkdown(markdown: string): Promise<string> {
  const document = await parseMarkdown(markdown)
  const components: Record<string, Type<unknown>> = { probe: Probe as Type<unknown> }

  class App {
    document: MarkdownDocumentType = document
    components = components
    data = {}
  }
  Component({
    selector: 'app-root',
    standalone: true,
    imports: [MarkdownDocument],
    template: `
      <comark-markdown-document
        [value]="document"
        [components]="components"
        [data]="data"
      />
    `,
  })(App)

  return renderApplication(
    (context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!DOCTYPE html><html><head></head><body><app-root></app-root></body></html>' }
  )
}

describe('MarkdownDocument: props scope when every attribute is omitted', () => {
  it('hides the grandparent props from children of an element with all attributes omitted', async () => {
    const html = await renderMarkdown(
      '::::wrap{label="Outer"}\n:::div{:data-x="{{ data.nope }}"}\n::probe{:text="props.label"}\n::\n:::\n::::'
    )
    expect(html).toContain('class="probe"')
    expect(html).not.toContain('[Outer]')
  })

  it('exposes the resolved attributes of the middle element to its children', async () => {
    const html = await renderMarkdown(
      '::::wrap{label="Outer"}\n:::div{:data-x="{{ data.nope }}" id="keep"}\n::probe{:text="props.id"}\n::\n:::\n::::'
    )
    expect(html).toContain('[keep]')
    expect(html).not.toContain('[Outer]')
  })

  it('keeps the parent props visible through bare wrappers', async () => {
    const html = await renderMarkdown('::::wrap{label="Outer"}\n- :probe{:text="props.label"}\n::::')
    expect(html).toContain('<ul>')
    expect(html).toContain('[Outer]')
  })
})

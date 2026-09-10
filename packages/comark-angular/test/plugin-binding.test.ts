import '@angular/compiler'
import { describe, expect, it } from 'vitest'
import { Component, provideZonelessChangeDetection, type Type } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { renderApplication } from '@angular/platform-server'
import { parseMarkdown, type MarkdownDocument as MarkdownDocumentType } from 'comark'
import { MarkdownDocument } from '../src/components/markdown-document.component.ts'
import { If } from '../src/plugins/binding.ts'

let probeInstances = 0

class Probe {
  constructor() {
    probeInstances += 1
  }
}
Component({
  selector: 'app-probe',
  standalone: true,
  template: 'Probe',
})(Probe)

async function renderMarkdown(markdown: string, data: Record<string, unknown>): Promise<string> {
  const document = await parseMarkdown(markdown)
  const components: Record<string, Type<unknown>> = {
    If: If as Type<unknown>,
    probe: Probe as Type<unknown>,
  }

  class App {
    document: MarkdownDocumentType = document
    components = components
    data = data
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

describe('@comark/angular plugins/binding — If component', () => {
  it('does not instantiate descendants of a hidden branch', async () => {
    probeInstances = 0
    const markdown = '::if{:condition="data.show" as="section"}\n:probe\n::'

    const hidden = await renderMarkdown(markdown, { show: false })
    expect(hidden).not.toContain('Probe')
    expect(probeInstances).toBe(0)

    const visible = await renderMarkdown(markdown, { show: true })
    expect(visible).toContain('<section>')
    expect(visible).toContain('Probe')
    expect(probeInstances).toBe(1)
  })
})

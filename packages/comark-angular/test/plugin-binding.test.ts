import { forCases } from '../../../test/fixtures/for'
import '@angular/compiler'
import { describe, expect, it } from 'vitest'
import { Component, provideZonelessChangeDetection, type Type } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { renderApplication } from '@angular/platform-server'
import { parseMarkdown, type MarkdownDocument as MarkdownDocumentType } from 'comark'
import { MarkdownDocument } from '../src/components/markdown-document.component.ts'
import binding, { Binding, For, If } from '../src/plugins/binding.ts'
import { nestedIfCases, nestedIfMarkdown } from '../../../test/fixtures/if'

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
  const document = await parseMarkdown(markdown, { plugins: [binding()] })
  const components: Record<string, Type<unknown>> = {
    If: If as Type<unknown>,
    Binding: Binding as Type<unknown>,
    For: For as Type<unknown>,
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
  it.each(nestedIfCases)('selects nested branches for $data', async ({ data, expected }) => {
    const html = await renderMarkdown(nestedIfMarkdown, data)
    expect(html.replace(/<[^>]*>/g, '').trim()).toBe(expected)
    expect(html).not.toContain('<template')
  })

  it.each([true, false])('does not instantiate the inactive slot for %s', async (show) => {
    probeInstances = 0
    const markdown = `::if{:value="data.show" as="section"}\n${show ? 'Visible' : ':probe'}\n#else\n${show ? ':probe' : 'Hidden'}\n::`
    const html = await renderMarkdown(markdown, { show })
    expect(html).toContain('<section>')
    expect(html).toContain(show ? 'Visible' : 'Hidden')
    expect(probeInstances).toBe(0)
  })

  it('does not instantiate descendants of a hidden branch', async () => {
    probeInstances = 0
    const markdown = '::if{:value="data.show" as="section"}\n:probe\n::'

    const hidden = await renderMarkdown(markdown, { show: false })
    expect(hidden).not.toContain('Probe')
    expect(probeInstances).toBe(0)

    const visible = await renderMarkdown(markdown, { show: true })
    expect(visible).toContain('<section>')
    expect(visible).toContain('Probe')
    expect(probeInstances).toBe(1)
  })
})

it.each(forCases)('For: $name', async ({ markdown, data, expected, absent }) => {
  const output = (await renderMarkdown(markdown, data))
    .replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  for (const text of expected) expect(output).toContain(text)
  for (const text of absent) expect(output).not.toContain(text)
})

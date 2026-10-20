import '@angular/compiler'
import { describe, expect, it } from 'vitest'
import { Component, provideZonelessChangeDetection } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { renderApplication } from '@angular/platform-server'
import { parseMarkdown, type MarkdownDocument as MarkdownDocumentType } from 'comark'
import { Markdown } from '../src/components/markdown.component.ts'
import { MarkdownDocument } from '../src/components/markdown-document.component.ts'

/**
 * Angular renders the component host element (`<comark-markdown>`,
 * `<comark-markdown-document>`) into the DOM, so plain HTML attributes
 * (`data-*`, `aria-*`, `id`, `role`, ...) set on it stay on the root.
 */
const attrTemplate =
  'id="answer" role="region" data-testid="answer" data-message-id="42" aria-label="Assistant reply" class="custom"'

async function renderTemplate(template: string, document?: MarkdownDocumentType): Promise<string> {
  class App {
    document = document
  }
  Component({
    selector: 'app-root',
    standalone: true,
    imports: [Markdown, MarkdownDocument],
    template,
  })(App)

  return renderApplication(
    (context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!DOCTYPE html><html><head></head><body><app-root></app-root></body></html>' }
  )
}

function hostTag(html: string, selector: string): string {
  return html.match(new RegExp(`<${selector}\\b[^>]*>`))?.[0] ?? ''
}

function expectHostAttributes(html: string, selector: string) {
  const host = hostTag(html, selector)
  expect(host).toContain('id="answer"')
  expect(host).toContain('role="region"')
  expect(host).toContain('data-testid="answer"')
  expect(host).toContain('data-message-id="42"')
  expect(host).toContain('aria-label="Assistant reply"')
  expect(host).toContain('class="custom"')
}

describe('root element attributes', () => {
  it('comark-markdown keeps static attributes on its host element', async () => {
    const document = await parseMarkdown('Hello **world**')
    const html = await renderTemplate(`<comark-markdown [value]="document" ${attrTemplate} />`, document)
    expectHostAttributes(html, 'comark-markdown')
    expect(html).toContain('<strong>world</strong>')
  })

  it('comark-markdown-document keeps static attributes on its host element', async () => {
    const document = await parseMarkdown('Hello')
    const html = await renderTemplate(`<comark-markdown-document [value]="document" ${attrTemplate} />`, document)
    expectHostAttributes(html, 'comark-markdown-document')
  })

  it('comark-markdown-document keeps bound attributes on its host element', async () => {
    const document = await parseMarkdown('Hello')
    const html = await renderTemplate(
      '<comark-markdown-document [value]="document" [attr.aria-busy]="true" [attr.data-message-id]="42" />',
      document
    )
    const host = hostTag(html, 'comark-markdown-document')
    expect(host).toContain('aria-busy="true"')
    expect(host).toContain('data-message-id="42"')
  })
})

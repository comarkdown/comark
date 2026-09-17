import '@angular/compiler'
import { describe, expect, it } from 'vitest'
import { Component, provideZonelessChangeDetection } from '@angular/core'
import { bootstrapApplication } from '@angular/platform-browser'
import { renderApplication } from '@angular/platform-server'
import { parseMarkdown } from 'comark'
import template from '@comark/angular/plugins/template'
import { MarkdownDocument } from '../src/components/markdown-document.component'
import { templateCases, visibleTemplateText } from '../../../test/fixtures/template'

describe('Angular templates', () => {
  it.each(templateCases)('renders $expected', async ({ source, data, expected }) => {
    const value = await parseMarkdown(source, { plugins: [template()] })
    class App {
      document = value
      data = data
    }
    Component({
      selector: 'app-root',
      standalone: true,
      imports: [MarkdownDocument],
      template: '<comark-markdown-document [value]="document" [data]="data" />',
    })(App)
    const output = await renderApplication(
      (context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context),
      { document: '<html><body><app-root></app-root></body></html>' }
    )
    expect(visibleTemplateText(output)).toBe(expected)
  })
})

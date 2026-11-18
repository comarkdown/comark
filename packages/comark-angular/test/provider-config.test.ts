import '@angular/compiler'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Component, provideZonelessChangeDetection, type Provider, type Type } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { bootstrapApplication } from '@angular/platform-browser'
import { renderApplication } from '@angular/platform-server'
import { parseMarkdown, type NodeTransform } from 'comark'
import emoji from 'comark/plugins/emoji'
import { Markdown } from '../src/components/markdown.component.ts'
import { MarkdownDocument } from '../src/components/markdown-document.component.ts'
import { defineMarkdownComponent, defineMarkdownDocumentComponent } from '../src/define.ts'

@Component({
  selector: 'app-config-alert',
  standalone: true,
  template: '<b class="config-alert"><ng-content /></b>',
})
class ConfigAlert {}

@Component({
  selector: 'app-instance-alert',
  standalone: true,
  template: '<b class="instance-alert"><ng-content /></b>',
})
class InstanceAlert {}

function renderApp(App: Type<unknown>): Promise<string> {
  return renderApplication(
    (context) => bootstrapApplication(App, { providers: [provideZonelessChangeDetection()] }, context),
    { document: '<!DOCTYPE html><html><head></head><body><app-root></app-root></body></html>' }
  )
}

function app(options: { imports: Type<unknown>[]; providers?: Provider[]; template: string }): any {
  class App {}
  Component({
    selector: 'app-root',
    standalone: true,
    imports: options.imports,
    providers: options.providers,
    template: options.template,
  })(App)
  return App
}

async function renderMarkdown(
  value: string,
  providers: Provider[],
  components?: Record<string, Type<any>>
): Promise<string> {
  await TestBed.configureTestingModule({ imports: [Markdown], providers }).compileComponents()
  const fixture = TestBed.createComponent(Markdown)
  fixture.componentRef.setInput('value', value)
  if (components) fixture.componentRef.setInput('components', components)
  fixture.detectChanges()
  await vi.waitFor(() => {
    expect(fixture.componentInstance.document).not.toBeNull()
    fixture.detectChanges()
  })
  return fixture.nativeElement.outerHTML as string
}

describe('Markdown config providers', () => {
  beforeEach(() => TestBed.resetTestingModule())

  it('applies config plugins, components, and class to static Markdown', async () => {
    const html = await renderMarkdown('::alert\n:smile:\n::', [
      defineMarkdownComponent({
        plugins: [emoji()],
        components: { alert: ConfigAlert },
        class: 'config-class',
      }),
    ])

    expect(html).toContain('config-class')
    expect(html).toContain('config-alert')
    expect(html).toContain('😄')
  })

  it('lets instance inputs override config components', async () => {
    const html = await renderMarkdown(
      '::alert\nHello\n::',
      [defineMarkdownComponent({ components: { alert: ConfigAlert } })],
      { alert: InstanceAlert }
    )

    expect(html).toContain('instance-alert')
    expect(html).not.toContain('config-alert')
  })

  it('runs config transformNode before the instance transformNode', async () => {
    const document = await parseMarkdown('Hello')
    const App = app({
      imports: [MarkdownDocument],
      providers: [
        defineMarkdownDocumentComponent({
          class: 'document-class',
          transformNode: ({ tag }) => (tag === 'p' ? { tag: 'section' } : undefined),
        }),
      ],
      template: '<comark-markdown-document [value]="document" [transformNode]="transformNode" />',
    })
    const instanceTransform: NodeTransform = ({ tag }) => (tag === 'section' ? { tag: 'article' } : undefined)
    App.prototype.document = document
    App.prototype.transformNode = instanceTransform

    const html = await renderApp(App)
    expect(html).toContain('document-class')
    expect(html).toContain('<article>Hello</article>')
  })

  it('works without a provider', async () => {
    const document = await parseMarkdown('Hello')
    const App = app({
      imports: [MarkdownDocument],
      template: '<comark-markdown-document [value]="document" />',
    })
    App.prototype.document = document

    const html = await renderApp(App)
    expect(html).toContain('<p>Hello</p>')
  })
})

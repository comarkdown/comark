import '@angular/compiler'
import { describe, expect, it } from 'vitest'
import { Component, input, provideZonelessChangeDetection } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import { bootstrapApplication, provideClientHydration } from '@angular/platform-browser'
import { renderApplication } from '@angular/platform-server'
import { parseMarkdown, type MarkdownDocument as MarkdownDocumentType } from 'comark'
import { Markdown } from '../src/components/markdown.component.ts'
import { MarkdownDocument } from '../src/components/markdown-document.component.ts'
import { MarkdownNode } from '../src/components/markdown-node.component.ts'

@Component({
  selector: 'markdown-code',
  standalone: true,
  template: `<div
    class="code-block"
    [attr.data-lang]="language()"
  >
    <ng-content />
  </div>`,
})
class ProsePre {
  readonly language = input<string>('')
  readonly code = input<string>('')
}

@Component({
  selector: 'custom-card',
  standalone: true,
  template: `<section class="card"><ng-content /></section>`,
})
class CustomCard {}

async function renderWithHydration(
  template: string,
  document: MarkdownDocumentType,
  components: Record<string, any>
): Promise<string> {
  class App {
    document = document
    components = components
  }
  Component({
    selector: 'app-root',
    standalone: true,
    imports: [Markdown, MarkdownDocument, MarkdownNode],
    template,
  })(App)

  return renderApplication(
    (context) =>
      bootstrapApplication(App, { providers: [provideZonelessChangeDetection(), provideClientHydration()] }, context),
    { document: '<!DOCTYPE html><html><head></head><body><app-root></app-root></body></html>' }
  )
}

describe('MarkdownNode view container anchor', () => {
  it('preserves the internal view container anchor across re-renders', async () => {
    await TestBed.configureTestingModule({
      imports: [MarkdownNode],
    }).compileComponents()

    const fixture = TestBed.createComponent(MarkdownNode)
    const hostEl = fixture.nativeElement as HTMLElement

    fixture.componentRef.setInput('components', { ProsePre })
    fixture.componentRef.setInput('node', ['p', {}, 'hello'])
    fixture.detectChanges()
    expect(hostEl.querySelector('p')?.textContent).toBe('hello')

    fixture.componentRef.setInput('node', ['pre', { language: 'ts' }, ['code', {}, 'const a = 1']])
    fixture.detectChanges()
    expect(hostEl.querySelector('p')).toBeNull()
    expect(hostEl.querySelector('markdown-code')?.textContent).toContain('const a = 1')

    fixture.componentRef.setInput('node', 'plain text')
    fixture.detectChanges()
    expect(hostEl.querySelector('markdown-code')).toBeNull()
    expect(hostEl.textContent).toBe('plain text')

    fixture.componentRef.setInput('node', ['pre', { language: 'js' }, ['code', {}, 'const b = 2']])
    fixture.detectChanges()
    expect(hostEl.querySelector('markdown-code')?.textContent).toContain('const b = 2')
  })
})

describe('SSR hydration serialization', () => {
  it('renders a fenced code block through a custom ProsePre component with hydration enabled', async () => {
    const doc = await parseMarkdown('```ts\nconst x = 1\n```')
    const html = await renderWithHydration(
      '<comark-markdown-document [value]="document" [components]="components" />',
      doc,
      { ProsePre }
    )

    expect(html).toContain('ngskiphydration="true"')
    expect(html).toContain('<markdown-code')
    expect(html).toContain('class="code-block"')
    expect(html).toContain('data-lang="ts"')
    expect(html).toContain('const x = 1')
  })

  it('renders a custom ProsePre component via comark-markdown with hydration enabled', async () => {
    const doc = await parseMarkdown('```ts\nconst y = 2\n```')
    const html = await renderWithHydration('<comark-markdown [value]="document" [components]="components" />', doc, {
      ProsePre,
    })

    expect(html).toContain('<markdown-code')
    expect(html).toContain('const y = 2')
  })

  it('renders nested custom components projecting content with hydration enabled', async () => {
    const doc = await parseMarkdown('::custom-card\n```ts\nconst z = 3\n```\n::')
    const html = await renderWithHydration(
      '<comark-markdown-document [value]="document" [components]="components" />',
      doc,
      { CustomCard, ProsePre }
    )

    expect(html).toContain('<custom-card')
    expect(html).toContain('<markdown-code')
    expect(html).toContain('const z = 3')
  })

  it('renders standalone comark-markdown-node with a custom component and hydration enabled', async () => {
    const doc = await parseMarkdown('```ts\nconst solo = 4\n```')
    const html = await renderWithHydration(
      '<comark-markdown-node [node]="document.nodes[0]" [components]="components" />',
      doc,
      { ProsePre }
    )

    expect(html).toContain('<markdown-code')
    expect(html).toContain('const solo = 4')
  })
})

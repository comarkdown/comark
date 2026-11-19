import '@angular/compiler'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { TestBed } from '@angular/core/testing'
import type { NodeTransform } from 'comark'
import { parseMarkdown } from 'comark'
import emoji from 'comark/plugins/emoji'
import { defineMarkdownComponent, defineMarkdownDocumentComponent } from '../src/define.ts'
import { ConfiguredMarkdown, ConfiguredMarkdownDocument, InstanceAlert } from './fixtures/defined/defined.ts'

describe('defineMarkdownComponent', () => {
  beforeEach(() => TestBed.resetTestingModule())

  it('returns a component class', () => {
    const Defined = defineMarkdownComponent()
    expect(typeof Defined).toBe('function')
  })

  it('accepts plugins, components, class, and parse options', () => {
    const plugin = { name: 'test', setup: () => {} }
    const transformNode: NodeTransform = () => undefined
    class FakeComponent {}
    const Defined = defineMarkdownComponent({
      plugins: [plugin as any],
      components: { alert: FakeComponent },
      class: 'prose',
      autoClose: true,
      transformNode,
    })

    expect(typeof Defined).toBe('function')
  })

  it('renders an imported factory component with its config', async () => {
    await TestBed.configureTestingModule({ imports: [ConfiguredMarkdown] }).compileComponents()
    const fixture = TestBed.createComponent(ConfiguredMarkdown)
    fixture.componentRef.setInput('value', '::alert\n:smile:\n::')
    fixture.detectChanges()

    await vi.waitFor(() => {
      fixture.detectChanges()
      expect(fixture.nativeElement.textContent).toContain('😄')
    })

    const html = fixture.nativeElement.outerHTML as string
    expect(html).toContain('factory-class')
    expect(html).toContain('config-alert')
  })

  it('keeps the first duplicate plugin from the factory config', async () => {
    const Defined = defineMarkdownComponent({ plugins: [emoji({ extend: { project: '🚀' } }), emoji()] })
    await TestBed.configureTestingModule({ imports: [Defined] }).compileComponents()
    const fixture = TestBed.createComponent(Defined)
    fixture.componentRef.setInput('value', ':project:')
    fixture.detectChanges()

    await vi.waitFor(() => {
      fixture.detectChanges()
      expect(fixture.nativeElement.textContent).toContain('🚀')
    })
  })

  it('lets instance components override the factory config', async () => {
    await TestBed.configureTestingModule({ imports: [ConfiguredMarkdown] }).compileComponents()
    const fixture = TestBed.createComponent(ConfiguredMarkdown)
    fixture.componentRef.setInput('value', '::alert\nHello\n::')
    fixture.componentRef.setInput('components', { alert: InstanceAlert })
    fixture.detectChanges()

    await vi.waitFor(() => {
      fixture.detectChanges()
      expect(fixture.nativeElement.textContent).toContain('Hello')
    })

    const html = fixture.nativeElement.outerHTML as string
    expect(html).toContain('instance-alert')
    expect(html).not.toContain('config-alert')
  })
})

describe('defineMarkdownDocumentComponent', () => {
  beforeEach(() => TestBed.resetTestingModule())

  it('returns a component class', () => {
    const Defined = defineMarkdownDocumentComponent()
    expect(typeof Defined).toBe('function')
  })

  it('accepts components, class, and transforms', () => {
    const transformNode: NodeTransform = () => undefined
    class FakeComponent {}
    const Defined = defineMarkdownDocumentComponent({
      components: { Math: FakeComponent },
      class: 'prose',
      transformNode,
    })

    expect(typeof Defined).toBe('function')
  })

  it('renders an imported factory component with its config', async () => {
    const document = await parseMarkdown('Hello\n\n::alert\nAlert\n::')
    await TestBed.configureTestingModule({ imports: [ConfiguredMarkdownDocument] }).compileComponents()
    const fixture = TestBed.createComponent(ConfiguredMarkdownDocument)
    fixture.componentRef.setInput('value', document)
    fixture.detectChanges()

    const html = fixture.nativeElement.outerHTML as string
    expect(html).toContain('factory-document-class')
    expect(html).toContain('config-alert')
    expect(html).toContain('<section>Hello</section>')
  })
})

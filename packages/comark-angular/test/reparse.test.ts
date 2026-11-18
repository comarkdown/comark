import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TestBed } from '@angular/core/testing'
import type { Provider, Type } from '@angular/core'
import { Markdown } from '../src/components/markdown.component.ts'
import { defineMarkdownComponent } from '../src/define.ts'

describe('Markdown re-parses when parser inputs change', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule()
  })

  async function render(component: Type<Markdown>, providers: Provider[] = []) {
    await TestBed.configureTestingModule({ imports: [component], providers }).compileComponents()
    const fixture = TestBed.createComponent(component)
    fixture.componentRef.setInput('value', 'Hello **world**')
    fixture.detectChanges()
    await vi.waitFor(() => {
      fixture.detectChanges()
      expect(fixture.nativeElement.querySelector('strong')).not.toBeNull()
    })
    return fixture
  }

  it('re-parses when `unwrap` changes', async () => {
    const fixture = await render(Markdown)
    expect(fixture.componentInstance.document!.nodes[0]?.[0]).toBe('p')
    expect(fixture.nativeElement.querySelector('p')).not.toBeNull()

    fixture.componentRef.setInput('unwrap', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      fixture.detectChanges()
      expect(fixture.nativeElement.querySelector('p')).toBeNull()
    })
    expect(fixture.nativeElement.querySelector('strong')?.textContent).toBe('world')
  })

  it('re-parses when `options` changes', async () => {
    const fixture = await render(Markdown)
    expect(fixture.nativeElement.querySelector('p')).not.toBeNull()

    fixture.componentRef.setInput('options', { unwrap: true })
    fixture.detectChanges()

    await vi.waitFor(() => {
      fixture.detectChanges()
      expect(fixture.nativeElement.querySelector('p')).toBeNull()
    })
  })

  it('re-parses with a defineMarkdownComponent config provider when `unwrap` changes', async () => {
    const fixture = await render(Markdown, [defineMarkdownComponent({})])
    expect(fixture.nativeElement.querySelector('p')).not.toBeNull()

    fixture.componentRef.setInput('unwrap', true)
    fixture.detectChanges()

    await vi.waitFor(() => {
      fixture.detectChanges()
      expect(fixture.nativeElement.querySelector('p')).toBeNull()
    })
    expect(fixture.nativeElement.querySelector('strong')?.textContent).toBe('world')
  })
})

import { describe, expect, it, vi, beforeEach } from 'vitest'
import { TestBed } from '@angular/core/testing'
import type { Type } from '@angular/core'
import { Markdown } from '../src/components/markdown.component.ts'
import { defineMarkdownComponent } from '../src/define.ts'

describe('Markdown re-parses when parser inputs change', () => {
  beforeEach(async () => {
    TestBed.resetTestingModule()
  })

  async function render(component: Type<Markdown>) {
    await TestBed.configureTestingModule({ imports: [component] }).compileComponents()
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

  it('re-parses a defineMarkdownComponent when `unwrap` changes', async () => {
    const Defined = defineMarkdownComponent({})
    const fixture = await render(Defined)
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

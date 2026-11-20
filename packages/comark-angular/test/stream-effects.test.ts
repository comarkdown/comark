import { beforeEach, describe, expect, it } from 'vitest'
import { Component, type Type } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import type { MarkdownDocument as MarkdownDocumentType, Node } from 'comark'
import { MarkdownDocument } from '../src/components/markdown-document.component.ts'

function doc(...nodes: Node[]): MarkdownDocumentType {
  return { nodes, frontmatter: {}, meta: {} }
}

class Badge {}
Component({
  selector: 'app-badge',
  standalone: true,
  template: '<b class="badge"><ng-content /></b>',
})(Badge)

describe('MarkdownDocument stream effects', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
  })

  async function render(value: MarkdownDocumentType, inputs: Record<string, unknown> = {}) {
    await TestBed.configureTestingModule({ imports: [MarkdownDocument] }).compileComponents()
    const fixture = TestBed.createComponent(MarkdownDocument)
    fixture.componentRef.setInput('value', value)
    for (const key in inputs) fixture.componentRef.setInput(key, inputs[key])
    fixture.detectChanges()
    const update = (next: MarkdownDocumentType) => {
      fixture.componentRef.setInput('value', next)
      fixture.detectChanges()
    }
    return { el: fixture.nativeElement as HTMLElement, update, fixture }
  }

  it('patches streamed text in place instead of rebuilding the block', async () => {
    const done: Node = ['p', {}, 'Done']
    const { el, update } = await render(doc(done, ['p', {}, 'Hello ', ['strong', {}, 'wor']]), { streaming: true })
    const paragraphs = el.querySelectorAll('p')
    const strong = el.querySelector('strong')

    update(doc(done, ['p', {}, 'Hello ', ['strong', {}, 'world'], '!']))
    expect(el.querySelectorAll('p')[0]).toBe(paragraphs[0])
    expect(el.querySelectorAll('p')[1]).toBe(paragraphs[1])
    expect(el.querySelector('strong')).toBe(strong)
    expect(el.textContent).toBe('DoneHello world!')
  })

  it('fades only new text and keeps fading spans mounted', async () => {
    const { el, update } = await render(doc(['p', {}, 'Hello']), { streaming: true, fade: { pace: false } })
    const first = el.querySelector('.comark-fade')
    expect(first?.textContent).toBe('Hello')

    update(doc(['p', {}, 'Hello world']))
    const spans = [...el.querySelectorAll('.comark-fade')]
    expect(spans.map((span) => span.textContent)).toEqual(['Hello', ' world'])
    expect(spans[0]).toBe(first)
  })

  it('appends a caret while streaming and removes it after', async () => {
    const { el, fixture } = await render(doc(['p', {}, 'Hi']), { streaming: true, caret: { class: 'cursor' } })
    expect(el.querySelector('p .cursor')).not.toBeNull()
    fixture.componentRef.setInput('streaming', false)
    fixture.detectChanges()
    expect(el.querySelector('.cursor')).toBeNull()
    expect(el.textContent).toBe('Hi')
  })

  it('keeps custom components in place while their siblings stream', async () => {
    const { el, update } = await render(doc(['p', {}, ['badge', {}, 'new'], ' tex']), {
      streaming: true,
      components: { badge: Badge as Type<unknown> },
    })
    const badge = el.querySelector('.badge')
    expect(badge?.textContent).toBe('new')

    update(doc(['p', {}, ['badge', {}, 'new'], ' text']))
    expect(el.querySelector('.badge')).toBe(badge)
    expect(el.textContent).toBe('new text')
  })
})

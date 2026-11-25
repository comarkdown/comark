import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { Component, Input, type Type } from '@angular/core'
import { TestBed } from '@angular/core/testing'
import type { MarkdownDocument as MarkdownDocumentType, Node } from 'comark'
import { caret, fade, pace } from 'comark/effects'
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

class Flaky {
  label?: string
  get text(): string | undefined {
    if (this.label === 'bad') throw new Error('bad label')
    return this.label
  }
}
Input()(Flaky.prototype, 'label')
Component({
  selector: 'app-flaky',
  standalone: true,
  template: '<i class="flaky">{{ text }}</i>',
})(Flaky)

describe('MarkdownDocument stream effects', () => {
  beforeEach(() => {
    TestBed.resetTestingModule()
  })

  afterEach(() => {
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
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
    const { el, update } = await render(doc(['p', {}, 'Hello']), {
      streaming: true,
      effects: [fade()],
    })
    const first = el.querySelector('.comark-fade')
    expect(first?.textContent).toBe('Hello')

    update(doc(['p', {}, 'Hello world']))
    const spans = [...el.querySelectorAll('.comark-fade')]
    expect(spans.map((span) => span.textContent)).toEqual(['Hello', ' world'])
    expect(spans[0]).toBe(first)
  })

  it('keeps releasing paced text on animation frames without new input', async () => {
    let time = 0
    const frames: FrameRequestCallback[] = []
    vi.spyOn(performance, 'now').mockImplementation(() => time)
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => frames.push(callback))
    vi.stubGlobal('cancelAnimationFrame', () => {})

    const full = 'Hi there, this sentence streams in at a steady pace'
    const { el, update, fixture } = await render(doc(['p', {}, 'Hi']), { streaming: true, effects: [pace(), fade()] })
    // End the stream with the last chunk so the trailing word is released too.
    fixture.componentRef.setInput('streaming', false)
    update(doc(['p', {}, full]))
    expect(el.textContent).not.toBe(full)
    expect(frames.length).toBeGreaterThan(0)

    for (let i = 0; i < 1000 && frames.length > 0; i++) {
      time += 50
      frames.shift()!(time)
      fixture.detectChanges()
    }
    expect(el.textContent).toBe(full)
    expect(frames.length).toBe(0)
  })

  it('appends a caret while streaming and removes it after', async () => {
    const { el, fixture } = await render(doc(['p', {}, 'Hi']), {
      streaming: true,
      effects: [caret({ class: 'cursor' })],
    })
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
  it('recreates a custom component after a failed update', async () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const ok: Node = ['p', {}, ['flaky', { label: 'ok' }]]
    const { el, update } = await render(doc(ok), { components: { flaky: Flaky } })
    expect(el.querySelector('.flaky')?.textContent).toBe('ok')
    update(doc(['p', {}, ['flaky', { label: 'bad' }]]))
    update(doc(ok))
    expect(el.querySelector('.flaky')?.textContent).toBe('ok')
  })
})

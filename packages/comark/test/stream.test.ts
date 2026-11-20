import { describe, expect, it } from 'vitest'
import { createMarkdownParser } from 'comark'
import type { ElementNode, Node } from 'comark'
import {
  appendCaret,
  caret,
  createCaretNode,
  createStreamRenderer,
  fade,
  getChildKeys,
  resolveStreamEffects,
} from 'comark/stream'
import type { StreamEffect } from 'comark/stream'

function clock(start = 0) {
  let time = start
  return {
    now: () => time,
    advance: (ms: number) => {
      time += ms
    },
  }
}

function fadeSpans(node: Node | Node[]): string[] {
  const out: string[] = []
  const walk = (n: Node) => {
    if (typeof n === 'string' || n[0] === null) return
    if ((n[1] as any).$?.key?.startsWith('comark-fade:')) out.push(n[2] as string)
    for (let i = 2; i < n.length; i++) walk(n[i] as Node)
  }
  for (const n of Array.isArray(node) && typeof node[0] !== 'string' ? (node as Node[]) : [node as Node]) walk(n)
  return out
}

const effects = [fade({ styles: false })]

describe('createStreamRenderer', () => {
  it('returns the input nodes when no effects run', () => {
    const nodes: Node[] = [['p', {}, 'a']]
    expect(createStreamRenderer().render(nodes, { streaming: true })).toBe(nodes)
  })

  it('keeps state per effect name across effect recreation', () => {
    const counter = (): StreamEffect<{ n: number }> => ({
      name: 'counter',
      init: () => ({ n: 0 }),
      apply(nodes, { state }) {
        state.n++
        return [...nodes, String(state.n)]
      },
    })
    const stream = createStreamRenderer()
    stream.render([], { effects: [counter()] })
    expect(stream.render([], { effects: [counter()] })).toEqual(['2'])
    stream.reset()
    expect(stream.render([], { effects: [counter()] })).toEqual(['1'])
  })

  it('orders resolved effects fade, custom, caret', () => {
    const custom: StreamEffect = { name: 'custom', apply: (n) => n }
    expect(resolveStreamEffects({ caret: true, fade: true, effects: [custom] }).map((e) => e.name)).toEqual([
      'fade',
      'custom',
      'caret',
    ])
    expect(resolveStreamEffects({})).toEqual([])
  })
})

describe('caret', () => {
  it('appends after the deepest last text without mutating the input', () => {
    const strong: ElementNode = ['strong', {}, 'bold']
    const p: ElementNode = ['p', {}, 'a ', strong]
    const first: ElementNode = ['p', {}, 'first']
    const nodes: Node[] = [first, p]
    const snapshot = JSON.stringify(nodes)

    const stream = createStreamRenderer()
    const out = stream.render(nodes, { streaming: true, effects: [caret()] })
    stream.render(nodes, { streaming: true, effects: [caret()] })

    expect(JSON.stringify(nodes)).toBe(snapshot)
    expect(out[0]).toBe(first)
    const outStrong = (out[1] as ElementNode)[3] as ElementNode
    expect(outStrong[2]).toBe('bold')
    expect((outStrong[3] as ElementNode)[1].$?.key).toBe('comark-caret')
  })

  it('appends to the top level when the last node has no text', () => {
    const nodes: Node[] = [['hr', {}]]
    const out = appendCaret(nodes, createCaretNode())
    expect(out).toHaveLength(2)
    expect(nodes).toHaveLength(1)
  })

  it('only renders while streaming and keeps a custom class', () => {
    const nodes: Node[] = [['p', {}, 'a']]
    expect(caret().apply(nodes, { streaming: false, now: 0, state: undefined })).toBe(nodes)
    const out = caret({ class: 'cursor' }).apply(nodes, { streaming: true, now: 0, state: undefined })
    expect(((out[0] as ElementNode)[3] as ElementNode)[1].class).toBe('cursor')
  })

  it('lands after a fading span', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = [fade({ styles: false }), caret()]
    stream.render([['p', {}, 'Hello']], { streaming: true, effects: all })
    const out = stream.render([['p', {}, 'Hello world']], { streaming: true, effects: all })
    const p = out[0] as ElementNode
    expect((p[p.length - 1] as ElementNode)[1].$?.key).toBe('comark-caret')
  })
})

describe('fade', () => {
  it('wraps only the streamed delta, not the whole block', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const first = stream.render([['p', {}, 'Hello']], { streaming: true, effects })
    expect(fadeSpans(first)).toEqual(['Hello'])

    time.advance(50)
    const second = stream.render([['p', {}, 'Hello world']], { streaming: true, effects })
    expect(fadeSpans(second)).toEqual(['Hello', ' world'])
    expect(second[0]).toEqual([
      'p',
      {},
      ['span', { $: { key: 'comark-fade:0' }, class: 'comark-fade' }, 'Hello'],
      ['span', { $: { key: 'comark-fade:5' }, class: 'comark-fade' }, ' world'],
    ])
  })

  it('merges a block back into plain text once its last chunk finishes', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    stream.render([['p', {}, 'Hello']], { streaming: true, effects })
    time.advance(200)
    stream.render([['p', {}, 'Hello world']], { streaming: true, effects })
    time.advance(200)
    // 'Hello' finished, but ' world' is still fading: spans stay so none shifts position.
    const mid = stream.render([['p', {}, 'Hello world']], { streaming: true, effects })
    expect(fadeSpans(mid)).toEqual(['Hello', ' world'])

    time.advance(200)
    const out = stream.render([['p', {}, 'Hello world!']], { streaming: true, effects })
    expect(out[0]).toEqual([
      'p',
      {},
      'Hello world',
      ['span', { $: { key: 'comark-fade:11' }, class: 'comark-fade' }, '!'],
    ])
    time.advance(400)
    const settled = [['p', {}, 'Hello world!']] as Node[]
    expect(stream.render(settled, { streaming: true, effects })).toBe(settled)
  })

  it('skips unchanged reused blocks by identity', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const done: ElementNode = ['p', {}, 'Done']
    stream.render([done], { streaming: true, effects })
    time.advance(400)
    const nodes: Node[] = [done, ['p', {}, 'Next']]
    const out = stream.render(nodes, { streaming: true, effects })
    expect(out[0]).toBe(done)
    expect(fadeSpans(out[1])).toEqual(['Next'])
  })

  it('does not replay text already shown when a block changes structure', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    stream.render([['p', {}, 'Title']], { streaming: true, effects })
    time.advance(400)
    const out = stream.render([['h2', {}, 'Title']], { streaming: true, effects })
    expect(out[0]).toEqual(['h2', {}, 'Title'])

    time.advance(10)
    const marked = stream.render([['p', {}, 'Some ', ['strong', {}, 'bold']]], { streaming: true, effects })
    expect(fadeSpans(marked)).toEqual(['Some ', 'bold'])
  })

  it('fades across inline elements and keeps offsets per block', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    stream.render([['p', {}, 'a ']], { streaming: true, effects })
    time.advance(400)
    const out = stream.render([['p', {}, 'a ', ['strong', {}, 'b'], ' c']], { streaming: true, effects })
    expect(out[0]).toEqual([
      'p',
      {},
      'a ',
      ['strong', {}, ['span', { $: { key: 'comark-fade:2' }, class: 'comark-fade' }, 'b']],
      ['span', { $: { key: 'comark-fade:3' }, class: 'comark-fade' }, ' c'],
    ])
  })

  it('never fades excluded subtrees', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const pre: ElementNode = ['pre', { language: 'js' }, ['code', {}, 'const a = 1']]
    const out = stream.render([pre, ['p', {}, 'x']], { streaming: true, effects })
    expect(out[0]).toBe(pre)
    expect(fadeSpans(out)).toEqual(['x'])
  })

  it('does not animate the initial render or non-streaming updates', () => {
    const stream = createStreamRenderer()
    const nodes: Node[] = [['p', {}, 'Loaded']]
    expect(stream.render(nodes, { streaming: false, effects })).toBe(nodes)
    const next: Node[] = [['p', {}, 'Loaded more']]
    expect(stream.render(next, { streaming: false, effects })).toBe(next)
  })

  it('staggers words and caps the queue at the duration', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const staggered = [fade({ styles: false, stagger: 100, duration: 300 })]
    const out = stream.render([['p', {}, 'one two three four five']], { streaming: true, effects: staggered })
    const p = out[0] as ElementNode
    const delays = p.slice(2).map((n) => ((n as ElementNode)[1].style as string | undefined) ?? '')
    expect(fadeSpans(out)).toEqual(['one ', 'two ', 'three ', 'four ', 'five'])
    expect(delays).toEqual([
      'animation-duration:300ms;',
      'animation-duration:300ms;animation-delay:100ms;',
      'animation-duration:300ms;animation-delay:200ms;',
      'animation-duration:300ms;animation-delay:300ms;',
      'animation-duration:300ms;animation-delay:300ms;',
    ])
  })

  it('applies custom class and easing', () => {
    const stream = createStreamRenderer({ now: () => 0 })
    const out = stream.render([['p', {}, 'x']], {
      streaming: true,
      effects: [fade({ class: 'my-fade', easing: 'linear' })],
    })
    expect((out[0] as ElementNode)[2]).toEqual([
      'span',
      { $: { key: 'comark-fade:0' }, class: 'my-fade', style: 'animation-timing-function:linear;' },
      'x',
    ])
  })

  it('stays correct over a real streaming parse', async () => {
    const parse = createMarkdownParser()
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const text = '# Title\n\nSome **bold** text with `code`.\n\n- one\n- two\n\n```js\nconst a = 1\n```\n'
    let previousText = ''
    for (let i = 1; i <= text.length; i += 3) {
      const doc = await parse(text.slice(0, i), { streaming: true })
      const snapshot = JSON.stringify(doc.nodes)
      const out = stream.render(doc.nodes, { streaming: true, effects: [fade({ styles: false }), caret()] })
      expect(JSON.stringify(doc.nodes)).toBe(snapshot)
      const visible = out.map((n) => textOf(n)).join('')
      expect(visible.replace(/\u2009/g, '')).toBe(doc.nodes.map((n) => textOf(n)).join(''))
      previousText = visible
      time.advance(16)
    }
    expect(previousText).toContain('const a = 1')
  })
})

describe('getChildKeys', () => {
  it('numbers elements independently of text splits', () => {
    const before = getChildKeys(['a ', ['strong', {}, 'b']])
    const after = getChildKeys(['a ', ['span', { $: { key: 'comark-fade:2' } }, 'c'], ['strong', {}, 'b']])
    expect(before).toEqual(['t0', '0'])
    expect(after).toEqual(['t0', 'comark-fade:2', '0'])
  })
})

function textOf(node: Node): string {
  if (typeof node === 'string') return node
  if (node[0] === null) return ''
  let out = ''
  for (let i = 2; i < node.length; i++) out += textOf(node[i] as Node)
  return out
}

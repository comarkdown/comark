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
  pace,
  resolveStreamEffects,
  typewriter,
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
    const key: string | undefined = (n[1] as any).$?.key
    if (key?.startsWith('comark-fade:') || key?.startsWith('comark-typewriter:')) out.push(n[2] as string)
    for (let i = 2; i < n.length; i++) walk(n[i] as Node)
  }
  for (const n of Array.isArray(node) && typeof node[0] !== 'string' ? (node as Node[]) : [node as Node]) walk(n)
  return out
}

const effects = [fade({ styles: false, pace: false })]

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

  it('orders resolved effects custom, fade, caret', () => {
    const custom: StreamEffect = { name: 'custom', apply: (n) => n }
    expect(resolveStreamEffects({ caret: true, fade: true, effects: [custom] }).map((e) => e.name)).toEqual([
      'custom',
      'fade',
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
    const all = [fade({ styles: false, pace: false }), caret()]
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

  it('delays words and caps the queue at the duration', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const delayed = [fade({ styles: false, pace: false, delay: 100, duration: 300 })]
    const out = stream.render([['p', {}, 'one two three four five']], { streaming: true, effects: delayed })
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

  it('reveals table cells word by word instead of all at once', async () => {
    const parse = createMarkdownParser()
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = [fade({ styles: false }), caret()]
    const text = [
      '| Renderer | Package           |',
      '| -------- | ----------------- |',
      '| Vue      | `@comark/vue`     |',
      '| React    | `@comark/react`   |',
      '',
    ].join('\n')
    const frames: string[] = []
    stream.render([], { streaming: true, effects: all })
    const show = (nodes: Node[]) =>
      frames.push(
        nodes
          .map((n) => textOf(n))
          .join('')
          .replace(/\u2009/g, '')
      )
    for (let i = 1; i <= text.length; i += 3) {
      const doc = await parse(text.slice(0, i), { streaming: true })
      show(stream.render(doc.nodes, { streaming: true, effects: all }))
      time.advance(16)
    }
    const full = await parse(text, { streaming: true })
    for (let n = 0; n < 2000 && stream.pending(); n++) {
      show(stream.render(full.nodes, { streaming: false, effects: all }))
      time.advance(16)
    }
    const stages = [...new Set(frames.filter(Boolean))]

    expect(stages).toEqual([
      'Renderer',
      'RendererPackage',
      'RendererPackageVue',
      'RendererPackageVue@comark/vue',
      'RendererPackageVue@comark/vueReact',
      'RendererPackageVue@comark/vueReact@comark/react',
    ])
  })

  it('applies custom class and easing', () => {
    const stream = createStreamRenderer({ now: () => 0 })
    const out = stream.render([['p', {}, 'x']], {
      streaming: true,
      effects: [fade({ class: 'my-fade', easing: 'linear', pace: false })],
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
      const out = stream.render(doc.nodes, {
        streaming: true,
        effects: [fade({ styles: false, pace: false }), caret()],
      })
      expect(JSON.stringify(doc.nodes)).toBe(snapshot)
      const visible = out.map((n) => textOf(n)).join('')
      expect(visible.replace(/\u2009/g, '')).toBe(doc.nodes.map((n) => textOf(n)).join(''))
      previousText = visible
      time.advance(16)
    }
    expect(previousText).toContain('const a = 1')
  })
})

describe('typewriter', () => {
  it('reveals one character per span at the given speed', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const effects = [typewriter({ styles: false, pace: false, speed: 100 })]
    const out = stream.render([['p', {}, 'abc']], { streaming: true, effects })
    const p = out[0] as ElementNode
    expect(p.slice(2)).toEqual([
      ['span', { $: { key: 'comark-typewriter:0' }, class: 'comark-typewriter' }, 'a'],
      ['span', { $: { key: 'comark-typewriter:1' }, class: 'comark-typewriter', style: 'animation-delay:10ms;' }, 'b'],
      ['span', { $: { key: 'comark-typewriter:2' }, class: 'comark-typewriter', style: 'animation-delay:20ms;' }, 'c'],
    ])
  })

  it('does not split surrogate pairs', () => {
    const stream = createStreamRenderer({ now: () => 0 })
    const out = stream.render([['p', {}, 'a😀']], {
      streaming: true,
      effects: [typewriter({ styles: false, pace: false })],
    })
    expect(fadeSpans(out)).toEqual(['a', '😀'])
  })

  it('keeps queued characters typing after the stream ends', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const effects = [typewriter({ styles: false, pace: false, speed: 10 })]
    stream.render([['p', {}, 'a']], { streaming: true, effects })
    const out = stream.render([['p', {}, 'abcdef']], { streaming: true, effects })
    const p = out[0] as ElementNode
    expect((p[p.length - 1] as ElementNode)[1].style).toBe('animation-delay:500ms;')
    time.advance(100)
    const closed = stream.render([['p', {}, 'abcdef']], { streaming: false, effects })[0] as ElementNode
    expect(closed[closed.length - 1]).toEqual(p[p.length - 1])
    time.advance(1000)
    expect(stream.render([['p', {}, 'abcdef']], { streaming: false, effects })).toEqual([['p', {}, 'abcdef']])
  })

  it('merges back into text once every character has appeared', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const effects = [typewriter({ styles: false, pace: false, speed: 100 })]
    stream.render([['p', {}, 'hi']], { streaming: true, effects })
    time.advance(500)
    const out = stream.render([['p', {}, 'hi!']], { streaming: true, effects })
    expect(out[0]).toEqual([
      'p',
      {},
      'hi',
      ['span', { $: { key: 'comark-typewriter:2' }, class: 'comark-typewriter' }, '!'],
    ])
    time.advance(500)
    const settled = [['p', {}, 'hi!']] as Node[]
    expect(stream.render(settled, { streaming: true, effects })).toBe(settled)
  })

  it('reveals the whole chunk at once when speed is infinite', () => {
    const stream = createStreamRenderer({ now: () => 0 })
    const out = stream.render([['p', {}, 'abc']], {
      streaming: true,
      effects: [typewriter({ styles: false, pace: false, speed: Infinity })],
    })
    expect(fadeSpans(out)).toEqual(['abc'])
  })
})

describe('pace', () => {
  it('releases text at the base speed while streaming', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const effects = [pace({ speed: 10 })]
    stream.render([['p', {}, '']], { streaming: true, effects })
    stream.render([['p', {}, 'Hello world']], { streaming: true, effects })
    time.advance(300)
    const out = stream.render([['p', {}, 'Hello world']], { streaming: true, effects })
    expect(out[0]).toEqual(['p', {}, 'Hel'])
  })

  it('keeps the base speed on a large backlog when catchUp is infinite', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const text = 'x'.repeat(1000)
    const effects = [pace({ speed: 60, catchUp: Infinity })]
    stream.render([['p', {}, '']], { streaming: true, effects })
    stream.render([['p', {}, text]], { streaming: true, effects })
    time.advance(1000)
    const out = stream.render([['p', {}, text]], { streaming: true, effects })
    expect(((out[0] as ElementNode)[2] as string).length).toBe(60)
  })

  it('speeds up only the part of the backlog beyond the catchUp window', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const text = 'x'.repeat(1000)
    const effects = [pace({ speed: 60, catchUp: 1000 })]
    stream.render([['p', {}, '']], { streaming: true, effects })
    stream.render([['p', {}, text]], { streaming: true, effects })
    time.advance(100)
    const out = stream.render([['p', {}, text]], { streaming: true, effects })
    // Excess 940 chars drains over the 1000ms window, so the rate is 60 + 940 = 1000 chars/s: 100ms releases about 100.
    expect(((out[0] as ElementNode)[2] as string).length).toBe(100)
  })

  it('drains the queue after the stream ends', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const effects = [pace({ speed: 10 })]
    stream.render([['p', {}, 'abcdef']], { streaming: true, effects })
    time.advance(1000)
    stream.render([['p', {}, 'abcdef']], { streaming: false, effects })
    time.advance(10000)
    expect(stream.render([['p', {}, 'abcdef']], { streaming: false, effects })).toEqual([['p', {}, 'abcdef']])
  })

  it('shows a static document at once', () => {
    const stream = createStreamRenderer({ now: () => 0 })
    const nodes: Node[] = [['p', {}, 'Loaded']]
    expect(stream.render(nodes, { streaming: false, effects: [pace()] })).toBe(nodes)
  })

  it('hides elements that have not started and keeps the tree valid', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const effects = [pace({ speed: 1, catchUp: 100000 })]
    stream.render([['p', {}, '']], { streaming: true, effects })
    const doc: Node[] = [
      ['p', {}, 'ab'],
      ['p', {}, 'cd'],
    ]
    stream.render(doc, { streaming: true, effects })
    time.advance(1000)
    expect(stream.render(doc, { streaming: true, effects })).toEqual([['p', {}, 'a']])
  })

  it('releases a streamed markdown document in order', async () => {
    const parse = createMarkdownParser()
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const text =
      '# Title\n\nSome **bold** text with `code` and a [link](https://example.com).\n\n- one\n- two\n\n```js\nconst a = 1\n```\n'
    const effects = [pace({ speed: 30, catchUp: 500 })]
    const full = await parse(text, { streaming: false })
    const plain = (nodes: Node[]) => nodes.map((n) => textOf(n)).join('')
    const seen: string[] = []
    for (let i = 1; i <= text.length; i += 4) {
      const doc = await parse(text.slice(0, i), { streaming: true })
      time.advance(50)
      seen.push(plain(stream.render(doc.nodes, { streaming: true, effects })))
    }
    for (let i = 0; i < 400; i++) {
      time.advance(50)
      seen.push(plain(stream.render(full.nodes, { streaming: false, effects })))
    }
    const final = plain(full.nodes)
    for (const frame of seen) expect(final.startsWith(frame)).toBe(true)
    expect(seen.at(-1)).toBe(final)
  })

  it('reports pending work until the backlog is released', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const effects = [pace({ speed: 10 })]
    stream.render([['p', {}, '']], { streaming: true, effects })
    stream.render([['p', {}, 'abcdef']], { streaming: true, effects })
    expect(stream.pending()).toBe(true)
    time.advance(10000)
    stream.render([['p', {}, 'abcdef']], { streaming: false, effects })
    expect(stream.pending()).toBe(false)
  })

  it('keeps fading text pace releases after the stream ends', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = resolveStreamEffects({
      fade: { styles: false, duration: 20000, pace: false },
      caret: true,
      effects: [pace({ speed: 100 })],
    })
    const source = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(40)
    const problems: string[] = []
    let sent = 0
    let lastChunk = 0
    let previous = ''
    for (let t = 0; t < 30000; t += 16) {
      time.advance(16)
      if (t - lastChunk >= 40 && sent < source.length) {
        sent = Math.min(source.length, sent + 200)
        lastChunk = t
      }
      const streaming = sent < source.length
      const out = stream.render([['p', {}, source.slice(0, sent)]], { streaming, effects: all })
      const shown = out.map((n) => textOf(n)).join('')
      const released = shown.replace(/\u2009/g, '').slice(previous.length)
      if (released && !fadeSpans(out).join('').endsWith(released)) problems.push(`t=${t}: released without fade`)
      previous = shown.replace(/\u2009/g, '')
      if (!streaming && !stream.pending()) break
      if (out.length === 0) continue
      const p = out[0] as ElementNode
      const last = p[p.length - 1]
      const lastIsCaret = typeof last !== 'string' && (last as ElementNode)[1]?.$?.key === 'comark-caret'
      if (t > 32 && shown.length > 0 && fadeSpans(out).length === 0 && !lastIsCaret)
        problems.push(`t=${t}: no fade spans, shown=${shown.length}`)
    }
    expect(problems).toEqual([])
  })

  it('fades text pace releases over many frames', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = resolveStreamEffects({
      fade: { styles: false, duration: 20000 },
      caret: true,
      effects: [pace({ speed: 100 })],
    })
    const text = 'Hello world this is a longer streamed sentence that keeps going for a while.'
    const doc: Node[] = [['p', {}, text]]
    const problems: string[] = []
    for (let frame = 0; frame < 60; frame++) {
      time.advance(50)
      const out = stream.render(doc, { streaming: frame < 40, effects: all })
      const shown = out.map((n) => textOf(n)).join('')
      const spans = fadeSpans(out).join('')
      if (shown.length > 0 && spans.length === 0)
        problems.push(`frame ${frame}: text shown without fade: ${JSON.stringify(shown)}`)
    }
    expect(problems).toEqual([])
  })

  it('does not mutate the input nodes', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const nodes: Node[] = [['p', {}, 'Hello ', ['strong', {}, 'bold']]]
    const snapshot = JSON.stringify(nodes)
    const effects = [pace({ speed: 5 })]
    stream.render(nodes, { streaming: true, effects })
    time.advance(500)
    stream.render(nodes, { streaming: true, effects })
    expect(JSON.stringify(nodes)).toBe(snapshot)
  })
})

describe('fade unit', () => {
  it('fades word by word by default', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = [fade({ styles: false, pace: false, delay: 10 })]
    stream.render([['p', {}, '']], { streaming: true, effects: all })
    const out = stream.render([['p', {}, 'Hi there']], { streaming: true, effects: all })
    expect(fadeSpans(out)).toEqual(['Hi ', 'there'])
  })

  it('fades one character at a time with unit char', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = [fade({ styles: false, pace: false, unit: 'char', delay: 10 })]
    stream.render([['p', {}, '']], { streaming: true, effects: all })
    expect(fadeSpans(stream.render([['p', {}, 'Hi']], { streaming: true, effects: all }))).toEqual(['H', 'i'])
    const out = stream.render([['p', {}, 'Hi!']], { streaming: true, effects: all })
    expect(fadeSpans(out)).toEqual(['H', 'i', '!'])
  })
})

describe('fade word mode with pace', () => {
  it('fades whole words, not partial words, while paced text is released', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = [fade({ styles: false, speed: 45, catchUp: 1000 })]
    const text = 'Hello there my friend '
    const spansByKey = new Map<string, string>()
    stream.render([['p', {}, '']], { streaming: true, effects: all })
    const collect = (out: Node[]) => {
      const p = out[0] as ElementNode | undefined
      if (!p) return
      const visible = textOf(p)
      expect(visible).toBe(text.slice(0, visible.length))
      expect(visible === '' || visible.endsWith(' ') || text.slice(visible.length)[0] === ' ').toBe(true)
      for (let j = 2; j < p.length; j++) {
        const child = p[j] as ElementNode
        const key = child[1]?.$?.key
        if (typeof key === 'string' && key.startsWith('comark-fade:')) spansByKey.set(key, child[2] as string)
      }
    }
    for (let i = 1; i <= text.length; i++) {
      time.advance(16)
      collect(stream.render([['p', {}, text.slice(0, i)]], { streaming: true, effects: all }))
    }
    while (stream.pending()) {
      time.advance(16)
      collect(stream.render([['p', {}, text]], { streaming: false, effects: all }))
    }
    expect([...spansByKey.values()]).toEqual(['Hello ', 'there ', 'my ', 'friend '])
  })
})

describe('fade pace keeps rendering until held words are shown', () => {
  it('keeps pending until the last word of each block is revealed', async () => {
    const parse = createMarkdownParser()
    const text =
      '# Streaming demo\n\nHello *world* and **bold** text.\n\nHere is a [link](https://comark.dev) mid-stream.\n'
    let t = 0
    const stream = createStreamRenderer({ now: () => t })
    const effects = () => [fade({ styles: false, speed: 10 }), caret()]
    for (let i = 10; i <= text.length + 10; i += 10) {
      t += 100
      const doc = await parse(text.slice(0, Math.min(i, text.length)), { streaming: true })
      stream.render(doc.nodes as Node[], { streaming: true, effects: effects() })
    }
    let last: Node[] = []
    for (let k = 0; k < 2000 && stream.pending(); k++) {
      t += 16
      const doc = await parse(text, { streaming: false })
      last = stream.render(doc.nodes as Node[], { streaming: false, effects: effects() })
    }
    expect(stream.pending()).toBe(false)
    expect(last.map(textOf)).toEqual(['Streaming demo', 'Hello world and bold text.', 'Here is a link mid-stream.'])
  })
})

describe('fade pace mid-stream', () => {
  it('shows completed blocks in full while the stream is still open', async () => {
    const parse = createMarkdownParser()
    const text =
      '# Streaming demo\n\nHello *world* and **bold** text.\n\nHere is a [link](https://comark.dev) mid-stream.\n'
    let t = 0
    const stream = createStreamRenderer({ now: () => t })
    const effects = () => [fade({ styles: false, speed: 10 }), caret()]
    let shown: string[] = []
    for (let i = 10; i <= 60; i += 10) {
      const doc = await parse(text.slice(0, i), { streaming: true })
      for (let frame = 0; frame < 3; frame++) {
        t += 1000
        shown = stream.render(doc.nodes as Node[], { streaming: true, effects: effects() }).map(textOf)
      }
    }
    expect(shown.slice(0, 2)).toEqual(['Streaming demo', 'Hello world and bold text.'])
  })
})

describe('pace option', () => {
  it('fade releases text at the paced speed instead of all at once', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = [fade({ styles: false, unit: 'char', delay: 10, speed: 10, catchUp: Infinity })]
    stream.render([['p', {}, '']], { streaming: true, effects: all })
    stream.render([['p', {}, 'Hello world']], { streaming: true, effects: all })
    time.advance(300)
    const out = stream.render([['p', {}, 'Hello world']], { streaming: true, effects: all })
    expect(textOf(out[0])).toBe('Hel')
    expect(stream.pending()).toBe(true)
  })

  it('typewriter releases text at the paced speed and keeps reporting pending', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = [typewriter({ speed: 5 })]
    stream.render([['p', {}, '']], { streaming: true, effects: all })
    stream.render([['p', {}, 'abcdefgh']], { streaming: true, effects: all })
    time.advance(400)
    const out = stream.render([['p', {}, 'abcdefgh']], { streaming: true, effects: all })
    expect(textOf(out[0])).toBe('ab')
    expect(stream.pending()).toBe(true)
  })

  it('drains paced text after the stream ends', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = [fade({ styles: false, speed: 100 })]
    stream.render([['p', {}, 'abc']], { streaming: true, effects: all })
    time.advance(1000)
    stream.render([['p', {}, 'abc']], { streaming: false, effects: all })
    expect(stream.pending()).toBe(false)
  })
})

describe('caret composition', () => {
  it('fade with caret ends with the caret after the faded text', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = [fade({ styles: false, pace: false }), caret()]
    stream.render([['p', {}, 'Hi']], { streaming: true, effects: all })
    const out = stream.render([['p', {}, 'Hi there']], { streaming: true, effects: all })
    const p = out[0] as ElementNode
    expect(p[p.length - 1]).toEqual(createCaretNode())
    expect(fadeSpans(out)).toEqual(['Hi', ' there'])
  })

  it('typewriter with caret ends with the caret after the typed text', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = [typewriter({ speed: 0, pace: false }), caret()]
    stream.render([['p', {}, 'Hi']], { streaming: true, effects: all })
    const out = stream.render([['p', {}, 'Hi!']], { streaming: true, effects: all })
    const p = out[0] as ElementNode
    expect(p[p.length - 1]).toEqual(createCaretNode())
    expect(textOf(out[0])).toBe('Hi!\u2009')
  })

  it('pace with fade and caret composes in one list', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = [pace({ speed: 1000 }), fade({ styles: false, pace: false }), caret()]
    stream.render([['p', {}, '']], { streaming: true, effects: all })
    stream.render([['p', {}, 'Hello']], { streaming: true, effects: all })
    time.advance(1000)
    const out = stream.render([['p', {}, 'Hello']], { streaming: true, effects: all })
    expect(fadeSpans(out)).toEqual(['Hello'])
    const p = out[0] as ElementNode
    expect(p[p.length - 1]).toEqual(createCaretNode())
  })
})

describe('getChildKeys', () => {
  it('numbers elements independently of text splits', () => {
    const before = getChildKeys(['a ', ['strong', {}, 'b']])
    const after = getChildKeys(['a ', ['span', { $: { key: 'comark-fade:2' } }, 'c'], ['strong', {}, 'b']])
    expect(before).toEqual(['t0', '0'])
    expect(after).toEqual(['t0', '$comark-fade:2', '0'])
  })
})

function textOf(node: Node): string {
  if (typeof node === 'string') return node
  if (node[0] === null) return ''
  let out = ''
  for (let i = 2; i < node.length; i++) out += textOf(node[i] as Node)
  return out
}

describe('pace timing', () => {
  const textAt = (out: Node[]) => out.map((n) => textOf(n)).join('')

  it('shows the first render at once and paces only later text', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const effects = [pace({ speed: 10 })]
    expect(textAt(stream.render([['p', {}, 'Hello']], { streaming: true, effects }))).toBe('Hello')
    expect(stream.pending()).toBe(false)
    stream.render([['p', {}, 'Hello world']], { streaming: true, effects })
    time.advance(300)
    expect(textAt(stream.render([['p', {}, 'Hello world']], { streaming: true, effects }))).toBe('Hello wo')
  })

  it('does not credit idle time to the next chunk', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const effects = [pace({ speed: 10 })]
    stream.render([['p', {}, '']], { streaming: true, effects })
    stream.render([['p', {}, 'A']], { streaming: true, effects })
    time.advance(100)
    expect(textAt(stream.render([['p', {}, 'A']], { streaming: true, effects }))).toBe('A')
    time.advance(5000)
    expect(textAt(stream.render([['p', {}, 'ABCD']], { streaming: true, effects }))).toBe('A')
    time.advance(100)
    expect(textAt(stream.render([['p', {}, 'ABCD']], { streaming: true, effects }))).toBe('AB')
  })

  it('keeps the catchUp bound independent of the frame rate', () => {
    const text = 'x'.repeat(1000)
    const run = (steps: number) => {
      const time = clock()
      const stream = createStreamRenderer({ now: time.now })
      const effects = [pace({ speed: 60, catchUp: 1000 })]
      stream.render([['p', {}, '']], { streaming: true, effects })
      stream.render([['p', {}, text]], { streaming: true, effects })
      let out: Node[] = []
      for (let i = 0; i < steps; i++) {
        time.advance(1000 / steps)
        out = stream.render([['p', {}, text]], { streaming: true, effects })
      }
      return textAt(out).length
    }
    expect(run(1)).toBe(1000)
    expect(run(10)).toBe(1000)
  })

  it('keeps the deadline of waiting text when more text arrives', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const effects = [pace({ speed: 1, catchUp: 1000 })]
    const text = 'x'.repeat(1000)
    stream.render([['p', {}, '']], { streaming: true, effects })
    stream.render([['p', {}, text]], { streaming: true, effects })
    time.advance(500)
    stream.render([['p', {}, text + 'y']], { streaming: true, effects })
    time.advance(500)
    const out = stream.render([['p', {}, text + 'yz']], { streaming: true, effects })
    expect(textAt(out).length).toBeGreaterThanOrEqual(1000)
  })

  it('never releases half of a surrogate pair', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const effects = [typewriter({ styles: false, speed: 10 })]
    const doc: Node[] = [['p', {}, 'a😀b']]
    stream.render([['p', {}, '']], { streaming: true, effects })
    const frames: string[] = []
    for (let i = 0; i < 10; i++) {
      frames.push(textAt(stream.render(doc, { streaming: true, effects })))
      time.advance(100)
    }
    expect(frames.some((f) => /[\ud800-\udbff](?![\udc00-\udfff])/.test(f))).toBe(false)
    expect(frames[frames.length - 1]).toBe('a😀b')
  })

  it('measures a reused element again where the depth limit cuts it', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const effects = [pace({ speed: 10 })]
    const shared: Node = ['span', {}, ['em', {}, 'x']]
    let deep: Node = shared
    for (let i = 0; i < 49; i++) deep = ['div', {}, deep]
    stream.render([shared], { streaming: true, effects })
    stream.render([shared, deep], { streaming: true, effects })
    expect(stream.pending()).toBe(false)
  })

  it('keeps text below the depth limit when everything is released', () => {
    let deep: Node = 'deep'
    for (let i = 0; i < 60; i++) deep = ['span', {}, deep]
    const nodes: Node[] = [deep]
    expect(createStreamRenderer().render(nodes, { streaming: false, effects: [pace()] })).toBe(nodes)
  })
})

describe('reveal edge cases', () => {
  it('reveals an excluded subtree whole while pacing', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const effects = [typewriter({ styles: false, speed: 1 })]
    const pre: Node = ['pre', {}, 'abc']
    stream.render([], { streaming: true, effects })
    const out = stream.render([pre, ['p', {}, 'de']], { streaming: true, effects })
    expect(out).toEqual([pre])
  })

  it('clips a held word without counting excluded text', () => {
    const stream = createStreamRenderer({ now: () => 0 })
    const effects = [fade({ styles: false, speed: Infinity })]
    const out = stream.render([['p', {}, ['math', {}, 'XYZ'], 'hello w']], { streaming: true, effects })
    expect(textOf(out[0])).toBe('XYZhello ')
    expect(stream.pending()).toBe(false)
  })

  it('fades the chunk that closes the stream', () => {
    const stream = createStreamRenderer({ now: () => 0 })
    stream.render([['p', {}, 'Hello']], { streaming: true, effects })
    const out = stream.render([['p', {}, 'Hello world']], { streaming: false, effects })
    expect(fadeSpans(out)).toContain(' world')
  })

  it('fades a block the closing chunk adds', () => {
    const stream = createStreamRenderer({ now: () => 0 })
    stream.render([['p', {}, 'One']], { streaming: true, effects })
    const out = stream.render(
      [
        ['p', {}, 'One'],
        ['p', {}, 'Two'],
      ],
      { streaming: false, effects }
    )
    expect(fadeSpans(out[1])).toEqual(['Two'])
  })

  it('fades the last text an upstream pace releases', () => {
    const time = clock()
    const stream = createStreamRenderer({ now: time.now })
    const all = [pace({ speed: 10 }), fade({ styles: false, pace: false, duration: 20000 })]
    stream.render([['p', {}, '']], { streaming: true, effects: all })
    stream.render([['p', {}, 'AB']], { streaming: true, effects: all })
    time.advance(100)
    stream.render([['p', {}, 'AB']], { streaming: true, effects: all })
    time.advance(100)
    const out = stream.render([['p', {}, 'AB']], { streaming: false, effects: all })
    expect(fadeSpans(out)).toEqual(['A', 'B'])
  })

  it('follows a changed pace option on retained state', () => {
    const stream = createStreamRenderer({ now: () => 0 })
    stream.render([['p', {}, 'Hi']], { streaming: false, effects: [fade({ styles: false })] })
    const out = stream.render([['p', {}, 'Hi there']], {
      streaming: true,
      effects: [fade({ styles: false, pace: false })],
    })
    expect(fadeSpans(out)).toEqual([' there'])
  })

  it('gives top-level text spans of different blocks distinct keys', () => {
    const stream = createStreamRenderer({ now: () => 0 })
    const out = stream.render(['one', ['hr', {}], 'two'], { streaming: true, effects })
    const keys = getChildKeys(out)
    expect(new Set(keys).size).toBe(keys.length)
  })

  it('keeps explicit keys apart from generated ones', () => {
    const keys = getChildKeys([
      ['p', { $: { key: '0' } }],
      ['p', {}],
    ])
    expect(keys[0]).not.toBe(keys[1])
  })

  it('reveals chunks at once with typewriter speed 0', () => {
    const stream = createStreamRenderer({ now: () => 0 })
    const all = [typewriter({ styles: false, speed: 0, pace: true })]
    stream.render([], { streaming: true, effects: all })
    stream.render([['p', {}, 'abc']], { streaming: true, effects: all })
    const out = stream.render([['p', {}, 'abc']], { streaming: false, effects: all })
    expect(textOf(out[0])).toBe('abc')
    expect(stream.pending()).toBe(false)
  })
})

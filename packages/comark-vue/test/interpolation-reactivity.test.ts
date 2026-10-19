import { describe, expect, it } from 'vitest'
import { Suspense, createRenderer, h, nextTick, reactive } from 'vue'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'
import binding from '../src/plugins/binding'

interface N {
  props: Record<string, unknown>
  parent: N | null
  children: N[]
  text?: string
}

const node = (text?: string): N => ({ props: {}, parent: null, children: [], text })
const { createApp } = createRenderer<N, N>({
  patchProp(el, key, _prev, next) {
    el.props[key] = next
  },
  insert(child, parent, anchor) {
    child.parent?.children.splice(child.parent.children.indexOf(child), 1)
    child.parent = parent
    const i = anchor ? parent.children.indexOf(anchor) : -1
    parent.children.splice(i < 0 ? parent.children.length : i, 0, child)
  },
  remove(child) {
    child.parent?.children.splice(child.parent.children.indexOf(child), 1)
    child.parent = null
  },
  createElement: () => node(),
  createText: (text) => node(text),
  createComment: (text) => node(text),
  setText(n, text) {
    n.text = text
  },
  setElementText(n, text) {
    n.children = [node(text)]
  },
  parentNode: (n) => n.parent,
  nextSibling: (n) => n.parent?.children[n.parent.children.indexOf(n) + 1] ?? null,
})

const titles = (n: N): unknown[] => [n.props.title, ...n.children.flatMap(titles)].filter((t) => t !== undefined)
const settle = async () => {
  await nextTick()
  await new Promise((resolve) => setTimeout(resolve, 10))
}

async function mount(markdown: string, data: Record<string, unknown>): Promise<N> {
  const value = await parseMarkdown(markdown, { plugins: [binding()] })
  const root = node()
  createApp({ render: () => h(Suspense, null, { default: () => h(MarkdownDocument, { value, data }) }) }).mount(root)
  await settle()
  return root
}

describe('prop interpolation reactivity', () => {
  it('updates when a data value changes', async () => {
    const data = reactive({ name: 'Ada' })
    const root = await mount(':span[x]{:title="Hi {{ data.name }}"}', data)
    expect(titles(root)).toEqual(['Hi Ada'])
    data.name = 'Bob'
    await settle()
    expect(titles(root)).toEqual(['Hi Bob'])
  })

  it('updates when a key is added after the first render', async () => {
    const data = reactive<Record<string, string>>({})
    const root = await mount(':span[x]{:title="Hi {{ data.extra || anon }}"}', data)
    expect(titles(root)).toEqual(['Hi anon'])
    data.extra = 'x'
    await settle()
    expect(titles(root)).toEqual(['Hi x'])
  })
})

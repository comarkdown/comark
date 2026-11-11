import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parseMarkdown } from 'comark'
import security from 'comark/plugins/security'
import { MarkdownDocument } from '../src/components/MarkdownDocument.ts'

const TEMPLATE_PAYLOAD = '<b>{{ 7 * 191 }}</b>'

// Polymorphic element like Reka UI's `Primitive`: renders whatever `as` / `is` / `tag` holds.
const Poly = defineComponent({
  props: {
    as: { type: null, default: undefined },
    is: { type: null, default: undefined },
    tag: { type: null, default: undefined },
  },
  setup(props) {
    return () => h((props.as || props.is || props.tag || 'div') as any, null, 'poly')
  },
})

// Renders a bound component value, like `<component :is>` on an app-provided prop.
const Icon = defineComponent({
  props: { icon: { type: null, default: undefined } },
  setup(props) {
    return () => h((props.icon || 'span') as any, null, 'icon')
  },
})

const Items = defineComponent({
  props: { items: { type: Array, default: () => [] } },
  setup(props) {
    return () =>
      h(
        'ul',
        null,
        (props.items as { label: string }[]).map((item) => h('li', null, item.label))
      )
  },
})

async function renderMarkdown(markdown: string) {
  const tree = await parseMarkdown(markdown)
  const app = createSSRApp({
    setup: () => () => h(MarkdownDocument, { value: tree, components: { poly: Poly, icon: Icon, items: Items } }),
  })
  return renderToString(app as any)
}

describe('bound props cannot smuggle a component into a polymorphic slot', () => {
  it('does not compile a `template` object passed as `as`', async () => {
    const html = await renderMarkdown(`::poly{:as='{"template":"${TEMPLATE_PAYLOAD}"}'}\n::`)
    expect(html).not.toContain('1337')
  })

  it('does not compile a `template` object passed as `is`', async () => {
    const html = await renderMarkdown(`::poly{:is='{"template":"${TEMPLATE_PAYLOAD}"}'}\n::`)
    expect(html).not.toContain('1337')
  })

  it('does not compile a `template` object passed as `tag`', async () => {
    const html = await renderMarkdown(`::poly{:tag='{"template":"${TEMPLATE_PAYLOAD}"}'}\n::`)
    expect(html).not.toContain('1337')
  })

  it('does not compile a nested `extends` component object', async () => {
    const html = await renderMarkdown(`::icon{:icon='{"extends":{"template":"${TEMPLATE_PAYLOAD}"}}'}\n::`)
    expect(html).not.toContain('1337')
  })

  it('does not compile `render`, `setup` or `mixins` component keys', async () => {
    for (const key of ['render', 'setup', 'mixins']) {
      const html = await renderMarkdown(`::icon{:icon='{"${key}":"${TEMPLATE_PAYLOAD}"}'}\n::`)
      expect(html).not.toContain('1337')
    }
  })

  it('does not compile a `template` object passed as an unbound `as`, `is` or `tag`', async () => {
    for (const key of ['as', 'is', 'tag']) {
      const html = await renderMarkdown(`::poly{${key}='{"template":"${TEMPLATE_PAYLOAD}"}'}\n::`)
      expect(html).not.toContain('1337')
      expect(html).toContain('<div>poly</div>')
    }
  })

  it('does not render a forged VNode or built-in component object', async () => {
    const payloads = [
      '{"__v_isVNode":true,"type":"script","props":{"src":"https://example.invalid/probe.js"},"shapeFlag":1}',
      '{"__v_isVNode":true,"type":"div","props":{"innerHTML":"<img src=x onerror=alert(1)>"},"shapeFlag":1}',
      '{"nested":[{"__v_isVNode":true,"type":"script","shapeFlag":1}]}',
      '{"__isTeleport":true}',
      '{"__isSuspense":true}',
      '{"__isKeepAlive":true}',
    ]
    for (const payload of payloads) {
      for (const plugins of [[], [security({ blockedTags: ['script'] })]]) {
        const tree = await parseMarkdown(`::icon{:icon='${payload}'}\n::`, { plugins })
        const app = createSSRApp({
          setup: () => () => h(MarkdownDocument, { value: tree, components: { icon: Icon } }),
        })
        const html = await renderToString(app as any)
        expect(html).not.toMatch(/<script|<img|probe\.js/)
        expect(html).toMatch(/^<div class="comark-content">(<span>icon<\/span>|<!---->)<\/div>$/)
      }
    }
  })

  it("does not render an element's own attributes as a forged VNode", async () => {
    // `h(tag, props)` renders a props bag marked as a VNode as a child, whatever the tag filters allow.
    const attrs = '{:__v_isVNode="true" type="script" :shapeFlag="9" children="probe"}'
    for (const markdown of [`::wrapper${attrs}\n::`, `x :wrapper${attrs}`]) {
      for (const plugins of [[], [security({ allowedTags: ['wrapper', 'p'] })]]) {
        const tree = await parseMarkdown(markdown, { plugins })
        const app = createSSRApp({ setup: () => () => h(MarkdownDocument, { value: tree }) })
        const html = await renderToString(app as any)
        expect(html).not.toContain('<script')
        expect(html).toContain('<wrapper')
      }
    }
  })

  it('keeps string tags for `as`', async () => {
    const html = await renderMarkdown('::poly{:as=\'"section"\'}\n::')
    expect(html).toContain('<section>poly</section>')
  })
})

describe('object props handed on to elements', () => {
  // `h(tag, prop)` reads a plain object as element props; spreading a prop does the same.
  const Label = defineComponent({
    props: { label: { type: null, default: undefined } },
    setup(props) {
      return () => h('span', props.label ?? 'none')
    },
  })
  const Spread = defineComponent({
    props: { items: { type: null, default: undefined } },
    setup(props) {
      return () =>
        h(
          'ul',
          null,
          ((props.items as object[]) || []).map((item) => h('li', { ...item }, 'item'))
        )
    },
  })

  async function render(markdown: string) {
    const tree = await parseMarkdown(markdown)
    const app = createSSRApp({
      setup: () => () => h(MarkdownDocument, { value: tree, components: { label: Label, spread: Spread } }),
    })
    return renderToString(app as any)
  }

  it('drops an object prop with an HTML sink at any depth', async () => {
    const sink = '"<img src=x onerror=alert(1)>"'
    const cases = [
      `::label{:label='{"innerHTML":${sink}}'}\n::`,
      `::label{:label='{".innerHTML":${sink}}'}\n::`,
      `::label{:label='{"textContent":"overwrite"}'}\n::`,
      `::label{label='{"innerHTML":${sink}}'}\n::`,
      `::spread{:items='[{"class":"a"},{"innerHTML":${sink}}]'}\n::`,
      `---\nl:\n  innerHTML: ${sink}\n---\n::label{:label="frontmatter.l"}\n::`,
    ]
    for (const markdown of cases) {
      const html = await render(markdown)
      expect(html).not.toMatch(/<img|overwrite/)
    }
  })

  it('keeps object props without HTML sinks', async () => {
    const html = await render(`::spread{:items='[{"class":"a"},{"title":"b"}]'}\n::`)
    expect(html).toContain('<ul><li class="a">item</li><li title="b">item</li></ul>')
  })
})

describe('data-valued bound props', () => {
  it('passes object and array data props through unchanged', async () => {
    const html = await renderMarkdown('::items{:items=\'[{"label":"a"}]\'}\n::')
    expect(html).toContain('<li>a</li>')
  })
})

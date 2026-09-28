import { describe, expect, it } from 'vitest'
import { createSSRApp, defineComponent, h } from 'vue'
import { renderToString } from '@vue/server-renderer'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'

const markdown = '```ruby {1} [app.rb] foo=bar\nputs 1\n```'

async function renderTree(components: Record<string, any> = {}) {
  const tree = await parseMarkdown(markdown)
  return renderToString(createSSRApp({ render: () => h(MarkdownDocument, { value: tree, components }) }))
}

describe('code blocks', () => {
  it('should render code block props as data attributes on native pre', async () => {
    const html = await renderTree()
    expect(html).toContain(
      '<pre data-language="ruby" data-highlights="[1]" data-filename="app.rb" data-meta="foo=bar"><code class="language-ruby">'
    )
  })

  it('should pass code block props unchanged to a custom pre component', async () => {
    const ProsePre = defineComponent({
      props: ['language', 'filename', 'highlights', 'meta'],
      setup(props, { slots }) {
        return () =>
          h(
            'div',
            {
              'data-props': JSON.stringify({
                language: props.language,
                filename: props.filename,
                highlights: props.highlights,
                meta: props.meta,
              }),
            },
            slots.default?.()
          )
      },
    })
    const html = await renderTree({ ProsePre })
    expect(html).toContain(
      '{&quot;language&quot;:&quot;ruby&quot;,&quot;filename&quot;:&quot;app.rb&quot;,&quot;highlights&quot;:[1],&quot;meta&quot;:&quot;foo=bar&quot;}'
    )
  })
})

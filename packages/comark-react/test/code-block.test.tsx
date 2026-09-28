import { describe, expect, it } from 'vitest'
import { renderToString } from 'react-dom/server'
import { parseMarkdown } from 'comark'
import { MarkdownDocument } from '../src/components/MarkdownDocument'

const markdown = '```ruby {1} [app.rb] foo=bar\nputs 1\n```'

describe('code blocks', () => {
  it('should render code block props as data attributes on native pre', async () => {
    const tree = await parseMarkdown(markdown)
    const html = renderToString(<MarkdownDocument value={tree} />)
    expect(html).toContain(
      '<pre data-language="ruby" data-highlights="[1]" data-filename="app.rb" data-meta="foo=bar"><code class="language-ruby">'
    )
  })

  it('should pass code block props unchanged to a custom pre component', async () => {
    const tree = await parseMarkdown(markdown)
    function ProsePre({ language, filename, highlights, meta }: any) {
      return <div data-props={JSON.stringify({ language, filename, highlights, meta })} />
    }
    const html = renderToString(
      <MarkdownDocument
        value={tree}
        components={{ ProsePre }}
      />
    )
    expect(html).toContain(
      '{&quot;language&quot;:&quot;ruby&quot;,&quot;filename&quot;:&quot;app.rb&quot;,&quot;highlights&quot;:[1],&quot;meta&quot;:&quot;foo=bar&quot;}'
    )
  })

  it('should keep code block props in the binding scope of native pre children', () => {
    const tree = {
      nodes: [['pre', { language: 'ruby' }, ['code', { ':data-lang': 'props.language' }, 'x']]],
      frontmatter: {},
      meta: {},
    } as any
    const html = renderToString(<MarkdownDocument value={tree} />)
    expect(html).toContain('<code data-lang="ruby">')
  })
})

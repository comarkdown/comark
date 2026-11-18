import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { describe, expect, it } from 'vitest'
import { build } from 'vite'
import type { NodeHandler } from 'comark'
import { parseMarkdown } from '../src/index'
import { renderMarkdown as renderComarkMarkdown } from '../src/render/index'
import { renderMarkdown } from '../src/render/markdown'

const markdown = [
  '# Title\n\nSome *emphasis*, **strong**, ~~deleted~~ and `code`.',
  '- one\n- two\n  - nested\n\n3. three\n4. four',
  '> quote\n>\n> - item',
  '> [!NOTE]\n> An alert',
  '```ts\nconst a = 1\n```\n\n    indented',
  '| a | b |\n| :- | -: |\n| 1 | `2` |',
  '[link](https://example.com "title"), <https://example.com> and ![alt](/img.png)',
  '- [ ] todo\n- [x] done',
  'line  \nbreak\n\n---\n\nafter',
  '\\*not emphasis\\*, 1\\. not a list and snake_case',
  '## Heading {#custom}\n\nText with <b>inline html</b>',
]

describe('comark/render/markdown', () => {
  it.each(markdown)('writes CommonMark and GFM as comark/render does: %j', async (source) => {
    const document = await parseMarkdown(source)
    expect(await renderMarkdown(document)).toBe(await renderComarkMarkdown(document))
  })

  it('writes components as HTML and leaves frontmatter out', async () => {
    const document = await parseMarkdown('---\ntitle: Hi\n---\n\n::alert{type="info"}\nCareful :badge[new]\n::')
    const html = await renderComarkMarkdown({ nodes: document.nodes }, { format: 'markdown/html' })
    expect(await renderMarkdown(document)).toBe(html)
    expect(html).toBe('<alert type="info">\n\nCareful <badge>new</badge>\n\n</alert>')
  })

  it('writes a break that has no trailing-space form as <br>', async () => {
    expect(await renderMarkdown({ nodes: [['p', {}, 'a ', ['br', {}], 'b']] })).toBe('a <br>b')
  })

  it('renders with custom components', async () => {
    const strong: NodeHandler = async (node, state) => `*${await state.flow(node, state)}*`
    const document = await parseMarkdown('Hello **world**')
    expect(await renderMarkdown(document, { components: { strong } })).toBe('Hello *world*')
  })
})

it('bundles without YAML or the component serializer', async () => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    build: {
      lib: { entry: fileURLToPath(new URL('../src/render/markdown.ts', import.meta.url)), formats: ['es'] },
      minify: true,
      write: false,
    },
  })
  const bundles = Array.isArray(result) ? result : [result]
  const chunks = bundles.flatMap((bundle) =>
    'output' in bundle ? bundle.output.filter((output) => output.type === 'chunk') : []
  )
  expect(chunks).toHaveLength(1)
  const chunk = chunks[0]!
  expect(gzipSync(chunk.code).length).toBeLessThan(12 * 1024)
  const retained = Object.entries(chunk.modules)
    .filter(([, module]) => module.renderedLength > 0)
    .map(([id]) => id)
  expect(retained.filter((id) => /js-yaml|\/yaml\.ts|frontmatter|handlers\/mdc\./.test(id))).toEqual([])
  const { renderMarkdown } = await import(`data:text/javascript;base64,${Buffer.from(chunk.code).toString('base64')}`)
  expect(await renderMarkdown({ nodes: [['p', {}, 'Hello ', ['strong', {}, 'world']]] })).toBe('Hello **world**')
})

it('imports comark/render/markdown without loading YAML or the component serializer in Node', () => {
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import { registerHooks } from 'node:module'
    import assert from 'node:assert/strict'
    registerHooks({
      load(url, context, next) {
        if (/js-yaml|\\/yaml\\.(js|ts)$|frontmatter|handlers\\/mdc\\./.test(url)) {
          throw new Error('Unexpected renderer dependency: ' + url)
        }
        return next(url, context)
      }
    })
    const { renderMarkdown } = await import('comark/render/markdown')
    assert.equal(await renderMarkdown({ nodes: [['p', {}, 'Hello']] }), 'Hello')
  `,
    ],
    { cwd: process.cwd(), encoding: 'utf8' }
  )
})

import { execFileSync } from 'node:child_process'
import * as nodeModule from 'node:module'
import { expect, it } from 'vitest'

const loadTest = it.skipIf(!('registerHooks' in nodeModule))

// Runs `script` in a fresh Node process that records every js-yaml module it loads.
function yamlLoads(script: string): string {
  return execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      `
    import { registerHooks } from 'node:module'
    import assert from 'node:assert/strict'
    let yamlLoaded = false
    registerHooks({
      load(url, context, next) {
        if (url.includes('js-yaml')) yamlLoaded = true
        return next(url, context)
      }
    })
    ${script}
    process.stdout.write(yamlLoaded ? 'loaded' : 'not loaded')
  `,
    ],
    { cwd: process.cwd(), encoding: 'utf8' }
  )
}

loadTest('parses and renders a document without frontmatter or YAML attributes without loading YAML', () => {
  const result = yamlLoads(`
    const { createMarkdownParser } = await import('comark/core')
    const { default: frontmatter } = await import('comark/plugins/frontmatter')
    const { renderMarkdown } = await import('comark/render')
    const tree = await createMarkdownParser({ plugins: [frontmatter()] })('# Hello\\n\\nSome *text*')
    assert.deepEqual(tree.frontmatter, {})
    assert.equal(await renderMarkdown(tree), '# Hello\\n\\nSome *text*')
  `)
  expect(result).toBe('not loaded')
})

loadTest('loads YAML for frontmatter and YAML attributes', () => {
  const result = yamlLoads(`
    const { createMarkdownParser } = await import('comark/core')
    const { default: frontmatter } = await import('comark/plugins/frontmatter')
    const { renderMarkdown } = await import('comark/render')
    const tree = await createMarkdownParser({ plugins: [frontmatter()] })('---\\ntitle: Hi\\n---\\n\\n# Hello')
    assert.deepEqual(tree.frontmatter, { title: 'Hi' })
    assert.equal(await renderMarkdown(tree), '---\\ntitle: Hi\\n---\\n\\n# Hello')
    const card = { nodes: [['card', { title: 'Card' }, 'Body']] }
    assert.equal(await renderMarkdown(card, { maxInlineAttributes: 0 }), '::card\\n\`\`\`yaml [props]\\ntitle: Card\\n\`\`\`\\nBody\\n::')
  `)
  expect(result).toBe('loaded')
})

it('exports parseFrontmatter and renderFrontmatter from comark/frontmatter only', async () => {
  const entry = await import('comark/frontmatter')
  expect(entry).toHaveProperty('parseFrontmatter')
  expect(entry).toHaveProperty('renderFrontmatter')
  expect('parseFrontmatter' in (await import('comark'))).toBe(false)
  expect('renderFrontmatter' in (await import('comark/render'))).toBe(false)
})

loadTest.each([
  '# Hello\n\nSome *text*',
  '::card{title="Card"}\nBody\n::',
  '::card\nBody\n\n---\n\nMore\n::',
  'Text\n\n---\n\nText',
  '::card\n```yaml\nheight: 400\n```\n::',
])('keeps YAML unloaded with default plugins: %j', (source) => {
  expect(
    yamlLoads(`
      const { parseMarkdown } = await import('comark')
      const { renderMarkdown } = await import('comark/render')
      await renderMarkdown(await parseMarkdown(${JSON.stringify(source)}))
    `)
  ).toBe('not loaded')
})

const yamlProps = 'title: Card\nheight: 400\n'
const frontmatterCard = `::card\n---\n${yamlProps}---\nBody\n::`
const propsCases = [
  frontmatterCard,
  frontmatterCard.replaceAll('\n', '\r\n'),
  frontmatterCard.replaceAll('\n', '\r'),
  frontmatterCard
    .split('\n')
    .map((line) => `  ${line}`)
    .join('\n'),
  `  ::card\n---\n${yamlProps}---\nBody\n  ::`,
  `::outer\n${frontmatterCard}\n::`,
  frontmatterCard
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n'),
  `- ${frontmatterCard.replaceAll('\n', '\n  ')}`,
  frontmatterCard.replace('::card', '::: card').replace(/::$/, ':::'),
]
for (const fence of ['```', '~~~']) {
  for (const language of ['yaml', 'yml']) {
    propsCases.push(`::card\n${fence}${language} [props]\n${yamlProps}${fence}\nBody\n::`)
  }
}

loadTest.each(propsCases)('loads and preserves component YAML props: %j', (source) => {
  expect(
    yamlLoads(`
      const { parseMarkdown } = await import('comark')
      assert.equal(yamlLoaded, false)
      const { visit } = await import('comark/utils')
      const tree = await parseMarkdown(${JSON.stringify(source)})
      let found = false
      visit(tree, node => Array.isArray(node) && node[0] === 'card', node => {
        found = true
        assert.equal(node[1].title, 'Card')
        assert.equal(node[1][':height'], '400')
      })
      assert.equal(found, true)
    `)
  ).toBe('loaded')
})

loadTest('loads component YAML when a streaming props block becomes complete', () => {
  expect(
    yamlLoads(`
      const { createMarkdownParser } = await import('comark')
      const parse = createMarkdownParser()
      await parse('::card\\nBody', { streaming: true })
      assert.equal(yamlLoaded, false)
      const tree = await parse(${JSON.stringify(frontmatterCard)}, { streaming: true })
      assert.equal(tree.nodes[0][0], 'card')
      assert.equal(tree.nodes[0][1][':height'], '400')
    `)
  ).toBe('loaded')
})

it('keeps the markdown-it adapter synchronous at its dedicated entry', async () => {
  const { default: MarkdownIt } = await import('markdown-it')
  const { markdownItComponents } = await import('comark/plugins/components/markdown-it')
  const tokens = new MarkdownIt().use(markdownItComponents).parse(frontmatterCard, {})
  const card = tokens.find((token) => token.tag === 'card' && token.nesting === 1)
  expect(card?.attrGet('title')).toBe('Card')
  expect(card?.attrGet(':height')).toBe('400')
})

loadTest.each([false, true])('prepares component YAML after source transforms, streaming=%j', (streaming) => {
  expect(
    yamlLoads(`
      const { createMarkdownParser } = await import('comark')
      const parse = createMarkdownParser({ plugins: [{
        name: 'strip-comments',
        async pre(state) {
          await Promise.resolve()
          state.markdown = state.markdown.replaceAll('<!-- props -->', '')
        },
      }] })
      if (${streaming}) await parse('# Before', { streaming: true })
      assert.equal(yamlLoaded, false)
      const tree = await parse(${JSON.stringify(frontmatterCard.replace('---', '---<!-- props -->'))}, { streaming: ${streaming} })
      assert.equal(tree.nodes[0][0], 'card')
      assert.equal(tree.nodes[0][1].title, 'Card')
      assert.equal(tree.nodes[0][1][':height'], '400')
    `)
  ).toBe('loaded')
})

loadTest.each([false, true])('supports markdown-it source transforms, streaming=%j', (streaming) => {
  expect(
    yamlLoads(`
      const { createMarkdownParser } = await import('comark')
      const parse = createMarkdownParser({ plugins: [{
        name: 'include',
        markdownItPlugins: [md => {
          md.core.ruler.before('block', 'include', state => {
            if (state.src === '{{include}}') state.src = ${JSON.stringify(frontmatterCard)}
          })
        }],
      }] })
      assert.equal(yamlLoaded, false)
      if (${streaming}) await parse('# Before', { streaming: true })
      const tree = await parse('{{include}}', { streaming: ${streaming} })
      assert.equal(tree.nodes[0][0], 'card')
      assert.equal(tree.nodes[0][1].title, 'Card')
      assert.equal(tree.nodes[0][1][':height'], '400')
    `)
  ).toBe('loaded')
})

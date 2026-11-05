import { execFileSync } from 'node:child_process'
import { expect, it } from 'vitest'

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

it('parses and renders a document without frontmatter or YAML attributes without loading YAML', () => {
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

it('loads YAML for frontmatter and YAML attributes', () => {
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
  expect(Object.keys(entry).sort()).toEqual(['parseFrontmatter', 'renderFrontmatter'])
  expect('parseFrontmatter' in (await import('comark'))).toBe(false)
  expect('renderFrontmatter' in (await import('comark/render'))).toBe(false)
})

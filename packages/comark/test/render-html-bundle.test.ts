import { execFileSync } from 'node:child_process'
import { gzipSync } from 'node:zlib'
import { expect, it } from 'vitest'
import { build } from 'vite'

it('bundles the HTML document export without Markdown serializers or YAML', async () => {
  const result = await build({
    configFile: false,
    logLevel: 'silent',
    plugins: [
      {
        name: 'html-consumer',
        resolveId(id) {
          if (id === 'html-consumer' || id.endsWith('/html-consumer')) return '\0html-consumer'
        },
        load(id) {
          if (id === '\0html-consumer') return "export { renderHtmlFromDocument } from '@comark/html/document'"
        },
      },
    ],
    build: { lib: { entry: 'html-consumer', formats: ['es'] }, minify: true, write: false },
  })
  const bundles = Array.isArray(result) ? result : [result]
  const chunks = bundles.flatMap((bundle) =>
    'output' in bundle ? bundle.output.filter((output) => output.type === 'chunk') : []
  )
  expect(chunks).toHaveLength(1)
  const chunk = chunks[0]!
  expect(gzipSync(chunk.code).length).toBeLessThan(8 * 1024)
  const retained = Object.entries(chunk.modules)
    .filter(([, module]) => module.renderedLength > 0)
    .map(([id]) => id)
  expect(retained.filter((id) => /js-yaml|internal\/stringify\/handlers\/(?!html\.|comment\.)/.test(id))).toEqual([])
  const { renderHtmlFromDocument } = await import(
    `data:text/javascript;base64,${Buffer.from(chunk.code).toString('base64')}`
  )
  expect(await renderHtmlFromDocument({ nodes: [['p', {}, 'Hello ', ['strong', {}, 'world']]] })).toBe(
    '<p>Hello <strong>world</strong></p>'
  )
})

it('imports the document entry without loading YAML or Markdown handlers in Node', () => {
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
        if (url.includes('js-yaml') ||
          (url.includes('/internal/stringify/handlers/') && !/\\/(html|comment)\\.(js|ts)$/.test(url))) {
          throw new Error('Unexpected renderer dependency: ' + url)
        }
        return next(url, context)
      }
    })
    const { renderHtmlFromDocument } = await import('@comark/html/document')
    assert.equal(await renderHtmlFromDocument({ nodes: [['p', {}, 'Hello']] }), '<p>Hello</p>')
  `,
    ],
    { cwd: process.cwd(), encoding: 'utf8' }
  )
})

/**
 * Runs the 165 bypass fixtures from vercel-labs/markdown-sanitizers
 * (`markdown-to-markdown-sanitizer/tests/bypass-attempts`, MIT, commit 765c471)
 * against Comark's `security` plugin.
 *
 * Two pipelines, mirroring upstream's two packages:
 * - `html`: parse + security + `@comark/html` (like harden-react-markdown)
 * - `markdown`: parse + security + `renderMarkdown`, then the sanitized
 *   markdown is rendered by a third party, markdown-it with `html: true`
 *   (like markdown-to-markdown-sanitizer)
 */
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it, vi } from 'vitest'
import MarkdownIt from 'markdown-it'
import { createMarkdownParser } from 'comark'
import { renderMarkdown } from 'comark/render'
import security from 'comark/plugins/security'
import { renderHtmlFromDocument } from '@comark/html'
import { ALLOWED_ELEMENTS, SECURITY_OPTIONS, validateHtml } from './validate'

vi.spyOn(console, 'warn').mockImplementation(() => {})

const fixturesDir = join(import.meta.dirname, 'fixtures/bypass-attempts')
const files = readdirSync(fixturesDir)
  .filter((file) => file.endsWith('.md'))
  .sort()

const parse = createMarkdownParser({
  plugins: [security({ ...SECURITY_OPTIONS, allowedTags: ALLOWED_ELEMENTS })],
})

const markdownIt = new MarkdownIt({ html: true, linkify: false, typographer: false })

const pipelines = {
  html: async (markdown: string) => renderHtmlFromDocument(await parse(markdown)),
  markdown: async (markdown: string) => markdownIt.render(await renderMarkdown(await parse(markdown))),
}

/**
 * Fixtures where something gets through. `it.fails` keeps the suite green while
 * documenting the gap; once a fix lands the test flips red, which is the signal
 * to remove the entry. `url-cases.test.ts` reduces each one to a single payload.
 */
const KNOWN_ISSUES: Record<keyof typeof pipelines, Set<string>> = {
  html: new Set([]),
  markdown: new Set([]),
}

describe('markdown-sanitizers bypass attempts', () => {
  it('found the fixtures', () => {
    expect(files.length).toBe(165)
  })

  for (const [name, pipeline] of Object.entries(pipelines) as Array<[keyof typeof pipelines, any]>) {
    describe(name, () => {
      for (const file of files) {
        const test = KNOWN_ISSUES[name].has(file) ? it.fails : it
        test(file, async () => {
          const markdown = readFileSync(join(fixturesDir, file), 'utf8')
          const issues = validateHtml(await pipeline(markdown))
          expect(issues).toEqual([])
        })
      }
    })
  }
})

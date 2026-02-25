import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseFrontmatter } from '../src/internal/front-matter'
import { parse } from '../src/index'
import highlight from '../src/plugins/highlight'
import { renderHTML, renderMarkdown } from '../src/string'
import cjk from '@comark/cjk'
import type { HighlightOptions } from '../src/plugins/highlight'
import emoji from '../src/plugins/emoji'

interface TestCase {
  input: string
  ast: string
  html: string
  markdown: string
  timeouts?: {
    parse?: number
    html?: number
    markdown?: number
  }
  options?: {
    highlight?: HighlightOptions
  }
}

function parseTimeout(timeoutStr: string): number {
  // Parse timeout string like "50ms" or "5s" to milliseconds
  const match = timeoutStr.match(/^(\d+)(ms|s)$/)
  if (!match) return 5000 // default 5 seconds

  const value = Number.parseInt(match[1], 10)
  const unit = match[2]
  const ms = unit === 's' ? value * 1000 : value
  return ms + (process.env.GITHUB_ACTIONS ? 20 : 0) /* add 20ms to avoid random Github Actions failures */
}

function extractFrontmatter(content: string): { timeouts?: TestCase['timeouts'], body: string, options?: TestCase['options'] } {
  const { content: body, data } = parseFrontmatter(content)

  if (!data || Object.keys(data).length === 0) {
    return { body }
  }

  const timeouts: TestCase['timeouts'] = {}

  if (data.timeout) {
    if (data.timeout.parse) timeouts.parse = parseTimeout(String(data.timeout.parse))
    if (data.timeout.html) timeouts.html = parseTimeout(String(data.timeout.html))
    if (data.timeout.markdown) timeouts.markdown = parseTimeout(String(data.timeout.markdown))
  }

  return {
    timeouts: Object.keys(timeouts).length > 0 ? timeouts : undefined,
    options: data.options as TestCase['options'] | undefined,
    body,
  }
}

function extractTestCase(content: string): TestCase {
  const { timeouts, body, options } = extractFrontmatter(content)
  const sections: Record<string, string> = {}

  // Extract sections - find each section header and its content
  const sectionHeaders = [...body.matchAll(/^## (Input|AST|HTML|Markdown)\s*\n\n```(\w+)\n/gm)]

  for (let i = 0; i < sectionHeaders.length; i++) {
    const match = sectionHeaders[i]
    const sectionName = match[1]
    const startPos = match.index! + match[0].length

    // Find the end position - either the next section header or end of body
    const endPos = i < sectionHeaders.length - 1
      ? sectionHeaders[i + 1].index!
      : body.length

    // Extract content between start and end, then find the last ``` before the next section
    const sectionText = body.substring(startPos, endPos)

    // Find the last ``` that's followed by newline and either ## or end
    // Look for ```\n followed by \n## or end of string (with optional whitespace)
    const closingPattern = /```[^\S\n]*\n(?=\n## |[^\S\n]*$)/g
    closingPattern.lastIndex = startPos

    let lastMatch: RegExpExecArray | null = null
    let currentMatch: RegExpExecArray | null

    while ((currentMatch = closingPattern.exec(body)) !== null) {
      if (currentMatch.index < endPos) {
        lastMatch = currentMatch
      }
      else {
        break
      }
    }

    if (lastMatch) {
      content = body.substring(startPos, lastMatch.index)
    }
    else {
      // Fallback: try to find ``` and remove it
      const fallbackMatch = sectionText.match(/^([\s\S]*?)```\s*$/)
      if (fallbackMatch) {
        content = fallbackMatch[1].trim()
      }
      else {
        content = sectionText.trim()
      }
    }

    sections[sectionName.toLowerCase()] = content.trim()
  }

  return {
    input: (sections.input || '').trim(),
    ast: (sections.ast || ''),
    html: sections.html || '',
    markdown: sections.markdown || '',
    timeouts,
    options,
  }
}

function findMarkdownFiles(dir: string, baseDir: string = dir): string[] {
  const files: string[] = []
  const entries = readdirSync(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fullPath = join(dir, entry.name)
    const relativePath = fullPath.replace(baseDir + '/', '')

    if (entry.isDirectory()) {
      files.push(...findMarkdownFiles(fullPath, baseDir))
    }
    else if (entry.isFile() && entry.name.endsWith('.md')) {
      files.push(relativePath)
    }
  }

  return files
}

// Run a single spec: SPEC=SPEC/MDC/inline-component.md pnpm vitest run test/index.test.ts
const specDir = join(process.cwd(), 'SPEC')
const specArg = String(process.env.npm_lifecycle_script || '').split('-- -spec ')[1] || ''

function loadTestCases(): Array<{ file: string, testCase: TestCase }> {
  if (specArg) {
    const absPath = specArg.startsWith('/') ? specArg : join(process.cwd(), specArg)
    const relativePath = absPath.replace(specDir + '/', '')
    const content = readFileSync(absPath, 'utf-8')
    return [{ file: relativePath, testCase: extractTestCase(content) }]
  }

  return findMarkdownFiles(specDir).map((file) => {
    const content = readFileSync(join(specDir, file), 'utf-8')
    return { file, testCase: extractTestCase(content) }
  })
}

const testCases = loadTestCases()

describe('Comark Tests', () => {
  it('should load test cases from SPEC directory', () => {
    expect(testCases.length).toBeGreaterThan(0)
  })

  testCases.forEach(({ file, testCase }) => {
    describe(file, () => {
      it('should parse input to AST', { timeout: testCase.timeouts?.parse ?? 5000 }, async () => {
        const plugins = [cjk(), emoji()]
        if (testCase.options?.highlight) {
          plugins.push(highlight(testCase.options.highlight))
        }
        const result = await parse(testCase.input, {
          autoUnwrap: false,
          ...testCase.options,
          plugins,
        })
        const expectedAST = JSON.parse(testCase.ast)

        expect(result).toEqual(expectedAST)
      })

      it('should render AST to HTML', { timeout: testCase.timeouts?.html ?? 5000 }, () => {
        const ast = JSON.parse(testCase.ast)
        const result = renderHTML(ast)
        const expectedHTML = testCase.html.trim()

        // Tests will fail until implementation is complete
        expect(result).toBe(expectedHTML)
      })

      it('should render AST to Markdown', { timeout: testCase.timeouts?.markdown ?? 5000 }, () => {
        const ast = JSON.parse(testCase.ast)
        const result = renderMarkdown(ast)
        const expectedMarkdown = testCase.markdown.trim()

        // Tests will fail until implementation is complete
        expect(result).toBe(expectedMarkdown)
      })
    })
  })
})

import { describe, it, expect, vi } from 'vitest'
import { parse } from 'comark'
import { renderANSI, createLog, log } from '../src/index'

// Helpers
const plain = (markdown: string) => renderANSI_sync(markdown, { colors: false })
const colored = (markdown: string) => renderANSI_sync(markdown, { colors: true })

async function renderANSI_sync(markdown: string, options?: Parameters<typeof renderANSI>[1]) {
  const tree = await parse(markdown)
  return renderANSI(tree, options)
}

describe('renderANSI', () => {
  describe('headings', () => {
    it('renders h1 with # prefix', async () => {
      const out = await plain('# Hello World')
      expect(out).toContain('# Hello World')
    })

    it('renders h2 with ## prefix', async () => {
      const out = await plain('## Section')
      expect(out).toContain('## Section')
    })

    it('renders h3 with ### prefix', async () => {
      const out = await plain('### Subsection')
      expect(out).toContain('### Subsection')
    })

    it('wraps heading in ANSI styles when colors enabled', async () => {
      const out = await colored('# Title')
      expect(out).toContain('\x1B[')
      expect(out).toContain('# Title')
      expect(out).toContain('\x1B[0m')
    })

    it('no escape codes when colors disabled', async () => {
      const out = await plain('# Title')
      expect(out).not.toContain('\x1B[')
    })
  })

  describe('inline formatting', () => {
    it('renders bold text', async () => {
      const out = await plain('This is **bold** text')
      expect(out).toContain('bold')
    })

    it('wraps bold in ANSI bold when colors enabled', async () => {
      const out = await colored('**bold**')
      expect(out).toContain('\x1B[1m')
      expect(out).toContain('bold')
      expect(out).toContain('\x1B[0m')
    })

    it('renders italic text', async () => {
      const out = await plain('_italic_')
      expect(out).toContain('italic')
    })

    it('wraps italic in ANSI italic when colors enabled', async () => {
      const out = await colored('_italic_')
      expect(out).toContain('\x1B[3m')
      expect(out).toContain('italic')
    })

    it('renders strikethrough', async () => {
      const out = await plain('~~removed~~')
      expect(out).toContain('removed')
    })

    it('renders inline code', async () => {
      const out = await plain('Use `npm install`')
      expect(out).toContain('npm install')
    })

    it('renders links with url in parens', async () => {
      const out = await plain('[comark](https://comark.dev)')
      expect(out).toContain('comark')
      expect(out).toContain('https://comark.dev')
    })
  })

  describe('blockquotes', () => {
    it('renders blockquote with │ prefix', async () => {
      const out = await plain('> Some quoted text')
      expect(out).toContain('│')
      expect(out).toContain('Some quoted text')
    })

    it('renders NOTE alert with icon and label', async () => {
      const out = await plain('> [!NOTE]\n> Important info')
      expect(out).toContain('ℹ')
      expect(out).toContain('NOTE')
      expect(out).toContain('Important info')
    })

    it('renders TIP alert', async () => {
      const out = await plain('> [!TIP]\n> Helpful tip')
      expect(out).toContain('◆')
      expect(out).toContain('TIP')
      expect(out).toContain('Helpful tip')
    })

    it('renders WARNING alert', async () => {
      const out = await plain('> [!WARNING]\n> Watch out')
      expect(out).toContain('⚠')
      expect(out).toContain('WARNING')
      expect(out).toContain('Watch out')
    })

    it('renders CAUTION alert', async () => {
      const out = await plain('> [!CAUTION]\n> Danger')
      expect(out).toContain('✖')
      expect(out).toContain('CAUTION')
    })

    it('renders IMPORTANT alert', async () => {
      const out = await plain('> [!IMPORTANT]\n> Critical')
      expect(out).toContain('‼')
      expect(out).toContain('IMPORTANT')
    })

    it('colors NOTE alert in blue', async () => {
      const out = await colored('> [!NOTE]\n> Info')
      expect(out).toContain('\x1B[34m') // BLUE
    })

    it('colors WARNING alert in yellow', async () => {
      const out = await colored('> [!WARNING]\n> Careful')
      expect(out).toContain('\x1B[33m') // YELLOW
    })
  })

  describe('lists', () => {
    it('renders unordered list items', async () => {
      const out = await plain('- First\n- Second\n- Third')
      expect(out).toContain('First')
      expect(out).toContain('Second')
      expect(out).toContain('Third')
    })

    it('renders ordered list items', async () => {
      const out = await plain('1. One\n2. Two\n3. Three')
      expect(out).toContain('One')
      expect(out).toContain('Two')
      expect(out).toContain('Three')
    })
  })

  describe('code blocks', () => {
    it('renders code block content', async () => {
      const out = await plain('```js\nconsole.log("hi")\n```')
      expect(out).toContain('console.log')
    })

    it('renders code block with filename', async () => {
      const out = await plain('```ts [app.ts]\nconst x = 1\n```')
      expect(out).toContain('app.ts')
      expect(out).toContain('const x = 1')
    })
  })

  describe('custom components', () => {
    it('renders custom component via components option', async () => {
      const tree = await parse('::badge{type="success"}\nDone\n::')
      const out = await renderANSI(tree, {
        colors: false,
        components: {
          badge: async ([, attrs, ...children], { render }) =>
            `[${String(attrs.type).toUpperCase()}] ${await render(children)}`,
        },
      })
      expect(out).toContain('[SUCCESS]')
      expect(out).toContain('Done')
    })

    it('passes data to component renderer', async () => {
      const tree = await parse('::info\nContent\n::')
      const out = await renderANSI(tree, {
        colors: false,
        data: { version: '3.0' },
        components: {
          info: async ([,, ...children], { render, data }) =>
            `v${data?.version}: ${await render(children)}`,
        },
      })
      expect(out).toContain('v3.0:')
      expect(out).toContain('Content')
    })

    it('renders children of custom components', async () => {
      const tree = await parse('::wrapper\n**bold** inside\n::')
      const out = await renderANSI(tree, {
        colors: false,
        components: {
          wrapper: async ([,, ...children], { render }) => `>> ${await render(children)}`,
        },
      })
      expect(out).toContain('>>')
      expect(out).toContain('bold')
    })
  })

  describe('async node handlers', () => {
    it('handler returning a Promise is awaited', async () => {
      const tree = await parse('::status{code="ok"}\nAll good\n::')
      const out = await renderANSI(tree, {
        colors: false,
        components: {
          status: async ([, attrs, ...children], { render }) => {
            const label = await Promise.resolve(String(attrs.code).toUpperCase())
            return `[${label}] ${await render(children)}`
          },
        },
      })
      expect(out).toContain('[OK]')
      expect(out).toContain('All good')
    })

    it('multiple async handlers run in the correct order', async () => {
      const tree = await parse('::a\n::b\nB\n::\n::c\nC\n::\n::')
      const log: string[] = []
      const out = await renderANSI(tree, {
        colors: false,
        components: {
          a: async ([,, ...children], { render }) => await render(children),
          b: async ([,, ...children], { render }) => {
            await Promise.resolve()
            log.push('b')
            return `B:${await render(children)}`
          },
          c: async ([,, ...children], { render }) => {
            await Promise.resolve()
            log.push('c')
            return `C:${await render(children)}`
          },
        },
      })
      expect(log).toEqual(['b', 'c'])
      expect(out.indexOf('B:')).toBeLessThan(out.indexOf('C:'))
    })

    it('async handler can resolve external data', async () => {
      const db: Record<string, string> = { metric: '99.9%' }
      const tree = await parse('::stat{key="metric"}\n::')
      const out = await renderANSI(tree, {
        colors: false,
        components: {
          stat: async ([, attrs]) => {
            const value = await Promise.resolve(db[String(attrs.key)] ?? 'N/A')
            return `Uptime: ${value}\n`
          },
        },
      })
      expect(out).toContain('Uptime: 99.9%')
    })
  })
})

describe('createLog', () => {
  it('returns a function', () => {
    const logFn = createLog()
    expect(typeof logFn).toBe('function')
  })

  it('calls write with rendered output', async () => {
    const written: string[] = []
    const logFn = createLog({ write: s => written.push(s) })
    await logFn('# Hello')
    expect(written).toHaveLength(1)
    expect(written[0]).toContain('Hello')
  })

  it('appends newline to output', async () => {
    const written: string[] = []
    const logFn = createLog({ write: s => written.push(s) })
    await logFn('Hello')
    expect(written[0]).toMatch(/\n$/)
  })

  it('reuses parser across calls', async () => {
    const written: string[] = []
    const logFn = createLog({ write: s => written.push(s) })
    await logFn('# Doc 1')
    await logFn('# Doc 2')
    expect(written[0]).toContain('Doc 1')
    expect(written[1]).toContain('Doc 2')
  })

  it('passes render options through', async () => {
    const written: string[] = []
    const logFn = createLog({
      colors: false,
      write: s => written.push(s),
    })
    await logFn('**bold**')
    expect(written[0]).not.toContain('\x1B[')
    expect(written[0]).toContain('bold')
  })
})

describe('log', () => {
  it('calls write with rendered output', async () => {
    const written: string[] = []
    await log('# Title', { write: s => written.push(s) })
    expect(written).toHaveLength(1)
    expect(written[0]).toContain('Title')
  })

  it('calls write once per invocation', async () => {
    const write = vi.fn()
    await log('Hello', { write })
    expect(write).toHaveBeenCalledTimes(1)
  })
})

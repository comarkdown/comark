import { Worker } from 'node:worker_threads'
import { describe, expect, it } from 'vitest'
import type { ThemedToken } from 'shiki'
import { comarkLanguages } from '../../src/plugins/shiki/language-comark'

const samples = [
  'Bundle :delta{from=412 to=388 unit="kB" better="lower"}, score :delta{from=91 to=88 better="higher"}',
  `:badge{${'a'.repeat(80)}},`,
  `:badge[label]{${'a'.repeat(80)}},`,
  `::badge{${'a'.repeat(80)}} trailing`,
  `Text {${'a'.repeat(80)}`,
  ':badge{title="a}b" label=\'c{d\'} next',
  ':badge[label]{title="a}b"} next',
  '::badge{title="a}b"}\nContent\n::',
]

// A synchronous regex hang must be stopped outside the highlighting thread.
async function highlightSamples(): Promise<ThemedToken[][][]> {
  const worker = new Worker(
    `
      const { parentPort, workerData } = require('node:worker_threads');
      (async () => {
        const { createHighlighterCore } = await import(workerData.core);
        const { createJavaScriptRegexEngine } = await import(workerData.engine);
        const { default: theme } = await import(workerData.theme);
        const highlighter = await createHighlighterCore({
          themes: [theme],
          langs: workerData.languages,
          engine: createJavaScriptRegexEngine({ forgiving: true }),
        });
        const result = workerData.samples.map(code => highlighter.codeToTokensBase(code, {
          lang: 'mdc', theme: 'github-dark', includeExplanation: true,
        }));
        highlighter.dispose();
        parentPort.postMessage(result);
      })();
    `,
    {
      eval: true,
      workerData: {
        core: import.meta.resolve('shiki/core'),
        engine: import.meta.resolve('shiki/engine/javascript'),
        theme: import.meta.resolve('shiki/themes/github-dark.mjs'),
        languages: comarkLanguages,
        samples,
      },
    }
  )
  let timer: ReturnType<typeof setTimeout> | undefined
  try {
    return await new Promise<ThemedToken[][][]>((resolve, reject) => {
      timer = setTimeout(() => reject(new Error('Comark highlighting stalled')), 3000)
      worker.once('message', resolve)
      worker.once('error', reject)
      worker.once('exit', (code) => {
        if (code !== 0) reject(new Error(`Highlight worker exited with code ${code}`))
      })
    })
  } finally {
    clearTimeout(timer)
    await worker.terminate()
  }
}

describe('Comark Shiki grammar', () => {
  it('highlights attributes without backtracking on punctuation or incomplete input', async () => {
    const results = await highlightSamples()
    expect(results.map((lines) => lines.map((line) => line.map((token) => token.content).join('')).join('\n'))).toEqual(
      samples
    )

    for (const lines of results.slice(5)) {
      const scopes = lines
        .flat()
        .flatMap((token) => token.explanation?.flatMap((part) => part.scopes.map((scope) => scope.scopeName)) ?? [])
      expect(scopes).toContain('entity.other.attribute-name.html')
      expect(scopes.some((scope) => scope.startsWith('entity.name.tag.'))).toBe(true)
    }
  }, 10000)
})

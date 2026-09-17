import { describe, expect, it } from 'vitest'
import { createSSRApp, h, onErrorCaptured } from 'vue'
import { renderToString } from '@vue/server-renderer'
import type { ComarkPlugin } from 'comark'
import { Markdown } from '../src/components/Markdown.ts'

describe('Markdown parse errors', () => {
  it('surfaces an initial parse failure instead of rendering an empty document', async () => {
    const failing: ComarkPlugin = {
      name: 'failing',
      post() {
        throw new Error('plugin exploded')
      },
    }

    const captured: unknown[] = []
    const app = createSSRApp({
      setup() {
        onErrorCaptured((error) => {
          captured.push(error)
          return false
        })
        return () => h(Markdown, { value: '# Hello', plugins: [failing] })
      },
    })

    const html = await renderToString(app as any)

    expect(captured).toHaveLength(1)
    expect((captured[0] as Error).message).toBe('plugin exploded')
    expect(html).not.toContain('comark-content')
  })
})

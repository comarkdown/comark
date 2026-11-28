import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../src/index.ts'

describe('code block token attributes', () => {
  it('preserves attributes set on fence tokens by markdown-it plugins (#525 case 35)', async () => {
    const attrsPlugin = (md: any) => {
      md.core.ruler.push('test_fence_attrs', (state: any) => {
        for (const token of state.tokens) {
          if (token.type === 'fence') {
            token.attrPush(['class', 'cls'])
            token.attrSet('data-line', '1')
          }
        }
      })
    }

    const { nodes } = await parseMarkdown('```js\nconst a = 1\n```', {
      plugins: [{ name: 'test-fence-attrs', markdownItPlugins: [attrsPlugin] }],
    })

    expect(nodes[0]).toEqual([
      'pre',
      { class: 'cls', 'data-line': '1', language: 'js' },
      ['code', { class: 'language-js' }, 'const a = 1'],
    ])
  })
})

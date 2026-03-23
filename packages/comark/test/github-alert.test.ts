import { describe, it, expect } from 'vitest'
import { parse } from '../src/index'
import githubAlert from '../src/plugins/alert'
import { renderHTML } from '@comark/html'

describe('githubAlert', () => {
  it('should convert !TIP to <svg> icon', async () => {
    const tree = await parse(`
> [!NOTE]
> Useful information that users should know, even when skimming content.

      `, {
      plugins: [githubAlert()],
    })
    const html = await renderHTML(tree)
    expect(html).toContain('<blockquote as="note">')
  })
})

import { describe, it, expect } from 'vitest'
import { parseMarkdown } from 'comark'
import githubAlert from '@comark/html/plugins/alert'
import { renderHTML } from '../src/index'

describe('githubAlert', () => {
  it('should convert !TIP to <svg> icon', async () => {
    const tree = await parseMarkdown(
      `
> [!NOTE]
> Useful information that users should know, even when skimming content.

      `,
      {
        plugins: [githubAlert()],
      }
    )
    const html = await renderHTML(tree)
    expect(html).toContain('<blockquote as="note">')
  })
})

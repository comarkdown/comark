import { describe, expect, it } from 'vitest'
import { parse } from 'comark'
import { renderMarkdown } from 'comark/render'

async function roundTrip(src: string): Promise<string> {
  const tree = await parse(`${src}\n`)
  return (await renderMarkdown(tree, {})).trim()
}

describe('image: attributes are preserved alongside a title', () => {
  it('keeps attributes when the image has no title', async () => {
    expect(await roundTrip('![alt](img.png){width="200"}')).toBe(
      '![alt](img.png){width="200"}',
    )
  })

  it('keeps the title when the image has no attributes', async () => {
    expect(await roundTrip('![alt](img.png "A title")')).toBe(
      '![alt](img.png "A title")',
    )
  })

  it('keeps width when the image also has a title', async () => {
    expect(await roundTrip('![alt](img.png "A title"){width="200"}')).toBe(
      '![alt](img.png "A title"){width="200"}',
    )
  })

  it('keeps class and width when the image also has a title', async () => {
    expect(
      await roundTrip('![alt](img.png "A title"){.rounded-asymmetric width="200"}'),
    ).toBe('![alt](img.png "A title"){.rounded-asymmetric width="200"}')
  })
})

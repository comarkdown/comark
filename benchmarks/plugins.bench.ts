import { bench, describe } from 'vitest'
import { createMarkdownParser } from 'comark'
import emoji from 'comark/plugins/emoji'
import footnotes from 'comark/plugins/footnotes'
import punctuation from 'comark/plugins/punctuation'
import security from 'comark/plugins/security'
import summary from 'comark/plugins/summary'
import toc from 'comark/plugins/toc'
import { mediumMarkdown } from './fixtures.ts'

const pluginMarkdown = `${mediumMarkdown}
## Extras :rocket: :tada:

"Smart quotes" -- with dashes... and a footnote[^1].

[^1]: The footnote body with **bold** text.

<script>alert('xss')</script>

[Link](javascript:alert(1))
`

const baseline = createMarkdownParser()
const withToc = createMarkdownParser({ plugins: [toc()] })
const withEmoji = createMarkdownParser({ plugins: [emoji()] })
const withPunctuation = createMarkdownParser({ plugins: [punctuation()] })
const withFootnotes = createMarkdownParser({ plugins: [footnotes()] })
const withSecurity = createMarkdownParser({ plugins: [security()] })
const withSummary = createMarkdownParser({ plugins: [summary()] })
const withAll = createMarkdownParser({
  plugins: [toc(), emoji(), punctuation(), footnotes(), security(), summary()],
})

describe('plugins', () => {
  bench('baseline (default plugins only)', async () => {
    await baseline(pluginMarkdown)
  })

  bench('toc', async () => {
    await withToc(pluginMarkdown)
  })

  bench('emoji', async () => {
    await withEmoji(pluginMarkdown)
  })

  bench('punctuation', async () => {
    await withPunctuation(pluginMarkdown)
  })

  bench('footnotes', async () => {
    await withFootnotes(pluginMarkdown)
  })

  bench('security', async () => {
    await withSecurity(pluginMarkdown)
  })

  bench('summary', async () => {
    await withSummary(pluginMarkdown)
  })

  bench('all of the above combined', async () => {
    await withAll(pluginMarkdown)
  })
})

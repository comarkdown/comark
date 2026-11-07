import { describe, expect, it } from 'vitest'
import { parseHtmlAttributes } from '../../src/internal/parse/utils'

describe('character references in HTML attribute values', () => {
  it.each([
    ['&lt;b&gt; &amp;amp; &copy;', '<b> &amp; ©'],
    ['&#65;&#x42;&#X43 &#x1F600;', 'ABC 😀'],
    ['&#0; &#xD800; &#99999999999; &#128;', '� � � €'],
    ['?a=1&copy=2&amp &lt', '?a=1&copy=2& <'],
    ['&copy2 &ampfoo; &notit;', '&copy2 &ampfoo; &notit;'],
    ['&notin& &backepsilonx', '&notin& &backepsilonx'],
    ['&bogus; &# &#x; & &&', '&bogus; &# &#x; & &&'],
  ])('%s', (value, expected) => {
    expect(parseHtmlAttributes(`title="${value}"`).title).toBe(expected)
  })
})

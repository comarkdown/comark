import { describe, expect, it } from 'vitest'
import { parse } from '../src/parse'
import { renderMarkdown } from '../src/render'

/**
 * A raw-HTML element round-trips when re-parsing the rendered markdown yields
 * the same tree. A blank line inside the element would terminate the HTML
 * block (or the paragraph, for inline HTML) and split the element apart.
 */
async function roundTrip(md: string) {
  const t1 = await parse(md)
  const rendered = await renderMarkdown(t1)
  const t2 = await parse(rendered)
  return { t1, t2, rendered }
}

describe('raw HTML round-trip (parse → renderMarkdown → parse)', () => {
  const cases: Record<string, string> = {
    'picture with source and img': '<picture>\n<source srcset="a.avif">\n<img src="a.jpg">\n</picture>',
    'figure with img and figcaption': '<figure>\n<img src="a.jpg">\n<figcaption>cap</figcaption>\n</figure>',
    'inline picture inside a paragraph': 'text <picture><source srcset="a.avif"><img src="a.jpg"></picture> tail',
    'details with summary and p': '<details>\n<summary>sum</summary>\n<p>body</p>\n</details>',
    'dl with dt and dd': '<dl>\n<dt>term</dt>\n<dd>def</dd>\n</dl>',
    'select with two options': '<select>\n<option>a</option>\n<option>b</option>\n</select>',
    'audio with two sources': '<audio controls>\n<source src="a.mp3">\n<source src="a.ogg">\n</audio>',
    'object with two params':
      '<object data="x.swf">\n<param name="a" value="1">\n<param name="b" value="2">\n</object>',
    'nested divs': '<div>\n<div>one</div>\n<div>two</div>\n</div>',
    'single-child video': '<video controls>\n<source src="a.mp4" type="video/mp4">\n</video>',
    'mixed text and element children': '<div>\nsome text\n<figcaption>cap</figcaption>\n</div>',
  }

  for (const [name, md] of Object.entries(cases)) {
    it(name, async () => {
      const { t1, t2, rendered } = await roundTrip(md)
      expect(rendered.trimEnd()).not.toMatch(/\n[ \t]*\n/)
      expect(t2.nodes).toEqual(t1.nodes)
    })
  }
})

import { parse } from 'comark'
import { renderHTML, renderMarkdown } from './packages/comark/src/string'

const content = `---
title: Hello World
---

# Hello **World**

::alert{type="info" :number="1"}
Hello world
::

:alert[Coucou]{type="info"}

`
const { body, data } = parse(content, {
  toc: true,
  frontmatter: true,
  summary: '<!-- more -->',
  plugins: [
    // docExtract({
    //   title: 'h1',
    //   description: 'blockquote',
    // }),
    // readtime({
    //   wordsPerMinute: 200,
    // }),
  ],
})
console.log(JSON.stringify(body, null, 2))

const result = parse(content) // ComarkTree
/**
 * {
 *   nodes: ComarkNode[],
 *   frontmatter: Record<string, any>,
 *   meta: {
 *     toc?: TOC,
 *     summary?: ComarkNode[],
 * .. // extended...
 *     title?: string, // guessed from the first heading
 *     description?: string, // guessed from the first paragraph
 *     readTime
 *   },
 * }
 */

const html = renderHTML(body, {
  components: {
    alert: ([tag, attrs, ...children], { render }) => {
      return `<div class="alert alert-${attrs.type}">${render(children)}</div>`
    },
    teub: ([_tag, _attrs, ...children], { render }) => {
      return `<div class="teub">${render(children)}</div>`
    },
  },
})
console.log(html)

const markdown = renderMarkdown(body, data)
console.log(markdown)

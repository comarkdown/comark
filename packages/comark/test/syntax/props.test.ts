import { describe, expect, it } from 'vitest'
import { parseProps } from '../../src/internal/parse/syntax/props'

function parseMarkdown(str: string) {
  const props = parseProps(str) || []
  return `\n${props.map(([key, value]) => `${key}=${value}`).join('\n')}\n`
}

describe('parseProps', () => {
  it('basic', () => {
    expect(parseMarkdown('{}')).toMatchInlineSnapshot(`
      "

      "
    `)

    expect(parseMarkdown('{.foo #my-id no-border}')).toMatchInlineSnapshot(`
      "
      class=foo
      id=my-id
      :no-border=true
      "
    `)

    expect(parseMarkdown('{foo=bar baz}')).toMatchInlineSnapshot(`
      "
      foo=bar
      :baz=true
      "
    `)

    expect(parseMarkdown('{str="foo bar" :num=123 bool=true arr=[1,2,3] obj={a:1,b:2}}')).toMatchInlineSnapshot(`
      "
      str=foo bar
      :num=123
      bool=true
      arr=[1,2,3]
      obj={a:1,b:2}
      "
    `)

    expect(parseMarkdown('{:items=\'["Nuxt", "Vue", "React"]\'}')).toMatchInlineSnapshot(`
      "
      :items=["Nuxt", "Vue", "React"]
      "
    `)

    expect(parseMarkdown('{:options=\'{"responsive": true, "scales": {"y": {"beginAtZero": true}}}\'}'))
      .toMatchInlineSnapshot(`
      "
      :options={"responsive": true, "scales": {"y": {"beginAtZero": true}}}
      "
    `)

    expect(parseMarkdown('{.bold#id .text.with_attribute}')).toMatchInlineSnapshot(`
      "
      class=bold
      id=id
      class=text
      class=with_attribute
      "
    `)

    expect(
      parseMarkdown(`
      {items='It\\'s me'}
    `)
    ).toMatchInlineSnapshot(`
      "
      items=It\\'s me
      "
    `)
  })
})

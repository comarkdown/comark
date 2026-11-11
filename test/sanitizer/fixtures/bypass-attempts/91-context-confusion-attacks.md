# Context Confusion Attacks

## Autolink inside code block that breaks out
```
<https://example.com/![test](javascript:alert('code-escape'))>
```

## Autolink inside inline code that breaks out
Here is `<https://example.com/![test](javascript:alert('inline-escape'))>` code.

## Autolink inside HTML comment
<!-- <https://example.com/![test](javascript:alert('comment-escape'))> -->

## Autolink inside CDATA
<![CDATA[<https://example.com/![test](javascript:alert('cdata-escape'))>]]>

## Autolink inside emphasis that breaks context
*This is emphasized <https://example.com/![test](javascript:alert('emphasis-break'))> text*

## Autolink inside strong emphasis
**Strong <https://example.com/![test](javascript:alert('strong-break'))> text**

## Autolink inside strikethrough
~~Strike <https://example.com/![test](javascript:alert('strike-break'))> text~~

## Autolink inside link text
[Link with <https://example.com/![test](javascript:alert('link-break'))> inside](https://safe.com)

## Autolink inside image alt text (if processed)
![Alt with <https://example.com/![test](javascript:alert('alt-break'))> inside](safe.jpg)

## Autolink inside heading
# Heading with <https://example.com/![test](javascript:alert('heading-break'))>

## Autolink inside blockquote
> Quote with <https://example.com/![test](javascript:alert('quote-break'))>

## Autolink inside list item
1. List with <https://example.com/![test](javascript:alert('list-break'))>
   - Nested with <https://example.com/![test](javascript:alert('nested-break'))>

## Autolink inside table cell
| Column 1 | Column 2 |
|----------|----------|
| <https://example.com/![test](javascript:alert('table-break'))> | Safe |

## Autolink inside definition list
Term
: Definition with <https://example.com/![test](javascript:alert('def-break'))>

## Autolink spanning multiple lines
<https://example.com/
![test](javascript:alert('multiline'))>

## Autolink with line break in middle
<https://example.com/![test](java
script:alert('line-break'))>

## Multiple autolinks creating parser confusion
<https://example.com/![a](javascript:alert('a'))> <https://example.com/![b](javascript:alert('b'))>

## Autolink with markdown reference inside
<https://example.com/![ref][dangerous]>

[dangerous]: javascript:alert('ref-danger')

## Autolink with nested brackets
<https://example.com/![outer ![inner](javascript:alert('inner'))>

## Autolink with escaped characters
<https://example.com/![test\]](javascript:alert('escaped'))>

## Autolink with HTML entities
<https://example.com/![test](javascript&#58;alert&#40;&#39;entity&#39;&#41;)>

## Autolink inside HTML tag attribute
<div title="<https://example.com/![test](javascript:alert('attr'))>">Content</div>

## Autolink inside raw HTML
<script>var url = "<https://example.com/![test](javascript:alert('raw-html'))>";</script>

## Autolink with protocol case variation
<HTTPS://example.com/![test](javascript:alert('protocol-case'))>

## Autolink with mixed content types
Text <https://example.com/![test](javascript:alert('mixed'))> `code` **bold**
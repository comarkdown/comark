# Markdown Parser Edge Cases

## Image inside inline code that breaks parsing
Here is `![test](javascript:alert('code'))` inline code.

## Image reference inside link text  
[Link with ![ref][malicious-ref] image](https://safe.com)

[malicious-ref]: javascript:alert('link-ref')

## Image inside emphasis that breaks emphasis
*This is emphasized ![test](javascript:alert('emphasis')) text*

## Image inside strong emphasis
**Strong text with ![test](javascript:alert('strong')) image**

## Image inside strikethrough
~~Strikethrough with ![test](javascript:alert('strike')) image~~

## Image reference with same name as link reference
[Shared reference name][shared]
![Also shared][shared]

[shared]: javascript:alert('shared')

## Image with autolink inside URL
![test](https://example.com/<user@example.com>)

## Image breaking autolink
This is an autolink: <https://example.com/![test](javascript:alert('autolink'))>

## Image inside heading
# Heading with ![test](javascript:alert('heading')) image

## Image inside blockquote
> Blockquote with ![test](javascript:alert('quote')) image

## Image inside list item
1. List item with ![test](javascript:alert('list')) image
   - Nested item with ![test](javascript:alert('nested-list')) image

## Image inside definition list
Term
: Definition with ![test](javascript:alert('definition')) image

## Image reference case sensitivity confusion
![Test][REF]
![test][ref]

[REF]: javascript:alert('upper')
[ref]: https://safe.com/image.jpg

## Image with reference containing whitespace
![test][ spaced ref ]

[ spaced ref ]: javascript:alert('spaced')

## Image reference with newlines in definition
![test][multiline]

[multiline]: javascript:
  alert('multiline')

## Image inside HTML block
<div>
![test](javascript:alert('html-block'))
</div>

## Image breaking HTML tag parsing
<img src="![test](javascript:alert('tag-break'))" />

## Image with reference inside angle brackets
![test][<malicious>]

[<malicious>]: javascript:alert('angle')

## Image inside setext heading
Heading Level 1
![test](javascript:alert('setext')) Image
================

## Image inside fenced code block language specifier
```javascript ![test](javascript:alert('lang'))
console.log('safe code');
```

## Image reference with URL containing brackets
![test][brackets]

[brackets]: https://example.com/path[with]brackets

## Image with escaped characters in alt text
![test\]with\[brackets](https://safe.com/image.jpg)

## Image reference with numeric label
![test][123]

[123]: javascript:alert('numeric')

## Image inside table cell
| Column 1 | Column 2 |
|----------|----------|
| ![test](javascript:alert('table-cell')) | Safe content |

## Image breaking table parsing
| Column ![test](javascript:alert('table-break')) | Content |

## Image with reference inside emphasis
*![test][*emphasized*] image*

[*emphasized*]: javascript:alert('emphasis-ref')
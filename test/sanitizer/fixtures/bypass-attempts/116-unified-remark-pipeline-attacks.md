# Unified/Remark Processing Pipeline Attacks

## Test 1: Remark parser state confusion
![test](javascript:alert('remark'))

**bold ![nested](javascript:alert('nested')) text**

## Test 2: Markdown-to-HTML boundary injection
Text before
![test](javascript:alert('boundary'))
Text after

## Test 3: Remark AST manipulation attempts
<!-- remark-parse-ignore -->
![test](javascript:alert('ignore'))

## Test 4: Unified pipeline plugin confusion
![test](javascript:alert('plugin'))
<raw-html>malicious content</raw-html>

## Test 5: allowDangerousHtml exploitation
<img src="javascript:alert('dangerous')" onerror="alert('error')" />
![markdown](https://example.com/safe.jpg)

## Test 6: rehypeRaw plugin bypass
<script>
![test](javascript:alert('rehype-raw'))
</script>

## Test 7: Mixed markdown and raw HTML parsing
Text with ![markdown](javascript:alert('mixed')) and <img src="javascript:alert('html')" />

## Test 8: Remark GFM extension exploitation
| Header | Value |
|--------|-------|
| Cell | ![test](javascript:alert('gfm')) |

## Test 9: Autolink normalization bypass
<javascript:alert('autolink')>
<https://example.com/javascript:alert('embed')>

## Test 10: Remark processing order exploitation
[reference-style link][dangerous]

![image][dangerous]

[dangerous]: javascript:alert('reference')

## Test 11: HTML block vs inline confusion
<div>
![test](javascript:alert('block-inline'))
</div>

<span>![test](javascript:alert('span-inline'))</span>

## Test 12: Remark emphasis parsing edge cases
*emphasized **strong ![image](javascript:alert('emphasis'))** text*

## Test 13: Complex nesting with raw HTML
<blockquote>
> Quote with ![image](javascript:alert('quote'))
<p>And HTML ![image](javascript:alert('html-quote'))</p>
</blockquote>

## Test 14: List parsing with injection
1. First item with ![image](javascript:alert('list1'))
   
   Continuation with <img src="javascript:alert('list-html')" />

2. Second item

## Test 15: Code block language injection
```javascript alert('lang-inject')
console.log('safe code');
```

## Test 16: Heading parsing with injection
# Heading with ![image](javascript:alert('heading'))

## Heading 2 <img src="javascript:alert('heading-html')" />

## Test 17: Link title injection
[text](https://example.com/safe "title with ![image](javascript:alert('title'))")

## Test 18: Reference link definition parsing
[safe text][ref]

[ref]: https://example.com/safe "![image](javascript:alert('ref-title'))"

## Test 19: HTML comment parsing edge cases
<!-- Comment with ![image](javascript:alert('comment')) -->
Text after comment

## Test 20: Markdown escaping edge cases
\![escaped](javascript:alert('escaped'))
![not escaped](javascript:alert('not-escaped'))
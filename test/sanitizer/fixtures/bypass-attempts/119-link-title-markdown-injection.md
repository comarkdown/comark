# Link Title Markdown Injection Bypass

## Test 1: Direct image injection in link title
[safe link](https://example.com/safe "![malicious](javascript:alert('title-image'))")

## Test 2: Reference link with image in title
[reference link][ref]

[ref]: https://example.com/safe "![image](javascript:alert('ref-title'))"

## Test 3: Multiple markdown elements in title
[link](https://example.com/safe "Text with ![img](javascript:alert('multi')) and [link](javascript:alert('nested'))")

## Test 4: Escaped markdown in title  
[link](https://example.com/safe "\![escaped](javascript:alert('escaped-title'))")

## Test 5: HTML entities in title with markdown
[link](https://example.com/safe "&#91;&#33;&#91;test&#93;&#40;javascript&#58;alert&#41;&#93;")

## Test 6: Complex nested markdown in title
[link](https://example.com/safe "**bold ![image](javascript:alert('bold-title'))** text")

## Test 7: Autolink in title
[link](https://example.com/safe "Visit <javascript:alert('autolink-title')>")

## Test 8: Code span in title with injection
[link](https://example.com/safe "Code: `![inject](javascript:alert('code-title'))`")

## Test 9: Reference-style image in title
[link](https://example.com/safe "Image: ![ref][dangerous-ref]")

[dangerous-ref]: javascript:alert('ref-in-title')

## Test 10: Title attribute confusion
[link](https://example.com/safe "title" onclick="alert('attr-confusion')")
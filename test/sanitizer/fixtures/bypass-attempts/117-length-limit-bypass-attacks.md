# Length Limit Bypass and DoS Attacks

## Test 1: URL length limit edge case
![test](https://example.com/path?param=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa)

## Test 2: Markdown length truncation with dangerous content at boundary
Normal content before truncation boundary
![test](javascript:alert('boundary'))

## Test 3: HTML length limit bypass (over 10KB)
<div>
![test](javascript:alert('html-length'))
<!-- This would be followed by thousands of characters to exceed 10KB limit -->
</div>

## Test 4: Compressed dangerous content via HTML entities
![&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;&#97;&#108;&#101;&#114;&#116;&#40;&#49;&#41;](https://example.com/img.jpg)

## Test 5: URL construction leading to exponential expansion
![test](https://example.com:65536/../../../javascript:alert('expansion'))

## Test 6: Nested structure depth attack
<div><div><div><div><div><div><div><div><div><div>
![test](javascript:alert('depth'))
</div></div></div></div></div></div></div></div></div></div>

## Test 7: Reference link expansion attack  
![test][ref1]
![test][ref2]
![test][ref3]

[ref1]: javascript:alert('ref1')
[ref2]: javascript:alert('ref2')  
[ref3]: javascript:alert('ref3')

## Test 8: Table cell expansion leading to memory exhaustion
| A | B | C | D | E |
|---|---|---|---|---|
| ![1](javascript:1) | ![2](javascript:2) | ![3](javascript:3) | ![4](javascript:4) | ![5](javascript:5) |

## Test 9: Code block with dangerous content near length limit
```
Safe code here...
![test](javascript:alert('code-block'))
```

## Test 10: Alt text length causing buffer overflow
![aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa<script>alert('alt-overflow')</script>](https://example.com/img.jpg)

## Test 11: Recursive reference causing infinite expansion
[recursive link][recursive]

[recursive]: [recursive link][recursive]

## Test 12: Large markdown document with dangerous content scattered
Normal paragraph 1.
Normal paragraph 2.
![test](javascript:alert('scattered1'))
Normal paragraph 3.
Normal paragraph 4.
![test](javascript:alert('scattered2'))
<!-- ... continues with many paragraphs and scattered dangerous content ... -->

## Test 13: Whitespace padding to manipulate length calculations
![test](javascript:alert('whitespace'))                                          

## Test 14: Unicode characters affecting byte vs character length
![test🚀🚀🚀🚀](javascript:alert('unicode-length'))

## Test 15: Null byte injection in length calculation context
![test](javascript:alert('null')%00padding)

## Test 16: HTML entity expansion affecting length
![&amp;lt;script&amp;gt;alert&amp;#40;1&amp;#41;&amp;lt;/script&amp;gt;](https://example.com/img.jpg)

## Test 17: Base64 encoded content expansion
![test](data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg==)

## Test 18: Multiple protocol schemes in single URL
![test](https://example.com/redirect?url=javascript:alert('nested-protocol'))

## Test 19: Fragment and query length manipulation
![test](https://example.com/path#aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa?param=bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb)

## Test 20: Markdown comment expansion attack
<!-- Very long comment with dangerous content ![test](javascript:alert('comment')) followed by thousands of characters to test comment processing limits and see if dangerous content can be hidden within comments that might not be properly handled by length limits -->

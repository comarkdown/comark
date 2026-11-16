# Image Syntax Confusion

## Incomplete image syntax with injection
![test](javascript:alert('incomplete')
More text here

## Image with broken alt text
![test"onclick="alert('attr')"](safe.jpg)

## Image nested in link
[![test](javascript:alert('nested'))](https://safe.com)

## Image with malformed brackets
![test]](javascript:alert('malformed'))
![test[(javascript:alert('bracket'))

## Image with escaped characters
![te\st](javascript:alert('escaped'))

## Image with HTML entities in alt
![&lt;script&gt;alert('alt')&lt;/script&gt;](safe.jpg)

## Image with control characters in alt
![test](safe.jpg)

## Multiple images on same line
![a](javascript:alert('a')) ![b](javascript:alert('b'))

## Image inside emphasis
*![test](javascript:alert('emphasis'))*

## Image inside strong emphasis
**![test](javascript:alert('strong'))**

## Image inside code span
`![test](javascript:alert('code'))`

## Image with line continuation
![test](javascript:\
alert('continuation'))

## Image with comment injection
![test](safe.jpg)<!-- javascript:alert('comment') -->

## Image with attribute-like syntax
![test src="javascript:alert('attr')"](safe.jpg)

## Image with HTML-like closing
![test](safe.jpg)</img>

## Mixed markdown and HTML image
<img src="![test](javascript:alert('mixed'))" />

## Image reference with HTML injection  
![test][injection]

[injection]: <javascript:alert('html-ref')>

## Image with null bytes
![test](javascript:alert('null'))

## Image with surrogate pairs
![test](𝒿𝒶𝓋𝒶𝓈𝒸𝓇𝒾𝓅𝓉:alert('surrogate'))
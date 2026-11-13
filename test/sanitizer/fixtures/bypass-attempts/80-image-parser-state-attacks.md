# Image Parser State Attacks

## Image with unmatched brackets
![test](javascript:alert('unmatched')

More content here that might close: )

## Image spanning multiple lines
![test](
    javascript:alert('multiline')
)

## Image with nested parentheses
![test](javascript:alert('nested()'))
![test](javascript:alert('nested(())'))

## Image with escaped parentheses  
![test](javascript:alert('escaped\)'))
![test](javascript:alert('escaped\\)'))

## Image breaking out of parsing context
![test](javascript:alert('break'))
---
Another section

## Image with markdown in URL
![test](https://example.com/[malicious](javascript:alert('nested')))

## Image reference with inline fallback
![test][missing](javascript:alert('fallback'))

## Image with title containing injection
![test](safe.jpg "javascript:alert('title')")
![test](safe.jpg 'javascript:alert('single')')

## Image title with quotes manipulation
![test](safe.jpg "title with \" injection")
![test](safe.jpg 'title with \' injection')

## Image with broken title syntax
![test](safe.jpg "unclosed title
![test](safe.jpg 'unclosed title

## Image with multiple titles
![test](safe.jpg "title1" "title2")
![test](safe.jpg 'title1' 'title2')

## Image breaking parser lookahead
![test](safe.jpg) and ![test2](javascript:alert('lookahead'))

## Image with state-confusing content
![test](safe.jpg)

```
This looks like code but might not be processed as such
![hidden](javascript:alert('hidden'))
```

## Image with reference-like syntax in URL
![test]([ref]: javascript:alert('ref-like'))

## Image URL with markdown emphasis
![test](javascript:alert(*emphasized*))

## Image with line-ending confusion
![test](javascript:alert('line'))\
![test2](safe.jpg)

## Image with backslash escapes in URL
![test](javascript:alert('backslash\\'))
![test](javascript\\:alert('scheme'))

## Image breaking out of emphasis context
*This is emphasized ![test](javascript:alert('emphasis'))* continued

## Image in table context
| Column 1 | Column 2 |
|----------|----------|
| ![test](javascript:alert('table')) | Normal content |

## Image reference with space tricks
![test] [spaced-ref]

[spaced-ref]: javascript:alert('spaced')
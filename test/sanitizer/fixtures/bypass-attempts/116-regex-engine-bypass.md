# Regex Engine Bypass Attempts

## Catastrophic backtracking attempts
![](javascript:alert('x' + 'a'.repeat(1000) + '!'))
[Link with very long text that could cause regex issues]('a'.repeat(2000) + 'javascript:alert("backtrack")')

## Regex boundary confusion
![](ajavascript:alert('boundary1'))  
![](javascript:alertb('boundary2'))
![](xjavascript:alert('x-prefix'))

## Regex anchor bypass attempts  
![](
javascript:alert('newline-start'))
![](javascript:alert('newline-end')
)

## Word boundary attacks
![](java_script:alert('underscore'))
![](java-script:alert('hyphen'))  
![](java.script:alert('dot'))
![](java script:alert('space'))

## Case-insensitive regex bypass
![](JAVASCRIPT:alert('UPPER'))
![](Javascript:alert('Title'))
![](jAvAsCrIpT:alert('aLtErNaTe'))

## Regex special char escaping
![](java\script:alert('backslash'))
![](java/script:alert('slash'))
![](java*script:alert('asterisk'))
![](java+script:alert('plus'))
![](java?script:alert('question'))
![](java.script:alert('dot2'))
![](java^script:alert('caret'))
![](java$script:alert('dollar'))
![](java|script:alert('pipe'))

## Character class bypass attempts
![](java[s]cript:alert('bracket'))
![](java{s}cript:alert('brace'))
![](java(s)cript:alert('paren'))
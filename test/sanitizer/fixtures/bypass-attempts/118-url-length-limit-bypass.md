# URL Length Limit Bypass Attempts

## URL just under length limit (200 chars default)
![](javascript:alert('a'.repeat(150)))

## URL exactly at length limit
![](javascript:alert('a'.repeat(168)))

## URL just over length limit - should be blocked
![](javascript:alert('a'.repeat(170)))

## Very long URL - should be blocked  
![](javascript:alert('a'.repeat(1000)))

## Long URL with percent encoding
![](javascript:alert('%41'.repeat(50)))

## Long safe URL that becomes longer after normalization
![](//example.com/path/with/many/segments/that/gets/normalized/to/longer/url/javascript:alert('expand'))

## URL that shrinks after normalization
![](https://example.com/./././././javascript:alert('shrink'))

## Boundary testing around normalization
![](./././javascript:alert('relative-long'))
![](../../../javascript:alert('traversal-long'))

## Mixed long and short URLs in same markdown
![](javascript:alert('short'))
![](javascript:alert('a'.repeat(300)))

## Long URL split across multiple lines (should still be caught)
![](javascript:alert('line1' +
'line2' + 'a'.repeat(200)))

## Zero-length limit bypass (if configured)
![](javascript:alert('zero-limit-test'))

## Edge case: exactly 200 characters
![](https://evil.com/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaajavascript:alert('200'))

## Long domain name
![](javascript://aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.com:alert('long-domain'))
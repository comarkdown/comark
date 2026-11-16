# Protocol Edge Cases and Bypass Attempts

## Case insensitive protocol bypasses
![](HTTPS://prefix.com/prefix/../../../evil.com/uppercase-protocol.js)
![](HtTpS://prefix.com/prefix/../../../evil.com/mixed-case-protocol.js)
![](https://prefix.com/prefix/../../../EVIL.COM/uppercase-domain.js)

## Protocol with unusual separators
![](https:///prefix.com/prefix/../../../evil.com/triple-slash.js)
![](https:////prefix.com/prefix/../../../evil.com/quad-slash.js)
![](https:\\\prefix.com/prefix/../../../evil.com/backslash-separator.js)

## Embedded protocol injection  
![](https://prefix.com/prefix/javascript:alert('embedded')/../../../safe.js)
![](https://prefix.com/prefix/data:text/html,<script>alert(1)</script>/../../../safe.js)
![](https://prefix.com/prefix/vbscript:msgbox("xss")/../../../safe.js)

## Protocol confusion with null bytes
![](https://prefix.com/prefix/../../evil.com%00/null-terminate.js)
![](https://prefix.com/prefix/../../evil.com%00safe.com/null-confuse.js)
![](javascript%00:alert('null-protocol')://prefix.com/prefix/safe.js)

## Protocol with unusual characters
![](https://prefix.com/prefix/../../evil.com/normal-looking.js#javascript:alert('fragment'))
![](https://prefix.com/prefix/?javascript:alert('query')/../../evil.com/query-injection.js)
![](https://prefix.com/prefix/\x00javascript:alert('control-char')/safe.js)

## Double protocol attempts
![](javascript:https://prefix.com/prefix/../../evil.com/double-protocol.js)
![](data:https://prefix.com/prefix/../../evil.com/data-https.js)
![](https://javascript://prefix.com/prefix/../../evil.com/https-javascript.js)
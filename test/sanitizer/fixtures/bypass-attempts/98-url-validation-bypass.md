# URL Validation Bypass Attempts

## Valid URLs with dangerous content that should pass URL parsing
<https://example.com/redirect?url=javascript:alert('redirect-attack')>

## Valid URL with data URI in parameter
<https://example.com/proxy?url=data:text/html,<script>alert('data-param')</script>>

## Valid URL with encoded javascript in query parameter
<https://example.com/search?q=javascript%3Aalert%28%27query-js%27%29>

## Valid URL with base64 encoded attack in parameter
<https://example.com/decode?data=amF2YXNjcmlwdDphbGVydCgnYmFzZTY0Jyk=>

## Valid URL with fragment containing attack
<https://example.com/page#javascript:alert('fragment-attack')>

## Valid URL with multiple encoded layers
<https://example.com/process?input=%252525%25252A%252528javascript%25253Aalert%25252528%2525252527encoded%2525252527%25252529%252529>

## Valid URL exploiting path traversal
<https://example.com/../../../javascript:alert('traversal')>

## Valid URL with authority confusion
<https://attacker.com@example.com/path>

## Valid URL with port that might be interpreted differently
<https://example.com:443@attacker.com/path>

## Valid URL with IPv6 localhost
<https://[::1]/javascript:alert('ipv6-localhost')>

## Valid URL with decimal IP representation
<https://2130706433/javascript:alert('decimal-ip')>

## Valid URL with hex IP representation
<https://0x7f000001/javascript:alert('hex-ip')>

## Valid URL with octal IP representation
<https://0177.0.0.1/javascript:alert('octal-ip')>

## Valid URL with international domain
<https://еxamplе.com/javascript:alert('idn-attack')>

## Valid URL with punycode
<https://xn--e1afmkfd.xn--p1ai/javascript:alert('punycode')>

## Valid URL with subdomain confusion
<https://example.com.attacker.com/javascript:alert('subdomain')>

## Valid URL with path confusion
<https://example.com/safe/../../javascript:alert('path-confusion')>

## Valid URL with query parameter injection
<https://example.com/safe?redirect=javascript:alert('query-inject')&safe=value>

## Valid URL with fragment after valid path
<https://example.com/safe/path#javascript:alert('valid-fragment')>

## Valid URL with case variations in domain
<https://EXAMPLE.COM/javascript:alert('case-domain')>

## Valid URL with case variations in scheme
<HTTPS://example.com/javascript:alert('case-scheme')>

## Valid URL with username in authority
<https://user@example.com/javascript:alert('username')>

## Valid URL with password in authority
<https://user:pass@example.com/javascript:alert('password')>

## Valid URL with empty username
<https://@example.com/javascript:alert('empty-user')>

## Valid URL with percent-encoded characters in domain
<https://ex%61mple.com/javascript:alert('encoded-domain')>

## Valid URL with percent-encoded characters in path
<https://example.com/p%61th/javascript:alert('encoded-path')>

## Valid URL with percent-encoded characters in query
<https://example.com/path?p%61ram=javascript:alert('encoded-query')>

## Valid URL with percent-encoded characters in fragment
<https://example.com/path#fr%61gment-javascript:alert('encoded-fragment')>

## Valid URL with mixed case percent encoding
<https://example.com/path?param=JavaScript%3aAlert%28%27Mixed%27%29>

## Valid URL with double encoding
<https://example.com/path?param=%2525javascript%253Aalert%2528%2527double%2527%2529>

## Valid URL with normalized path components
<https://example.com/./javascript:alert('dot-path')>

## Valid URL with directory traversal in query
<https://example.com/safe?path=../../../javascript:alert('query-traversal')>

## Valid URL with null byte after valid content
<https://example.com/safe%00javascript:alert('null-byte')>

## Valid URL with CRLF injection
<https://example.com/safe%0D%0AJavascript:alert('crlf-inject')>

## Valid URL with tab injection
<https://example.com/safe%09javascript:alert('tab-inject')>

## Valid URL with newline injection
<https://example.com/safe%0Ajavascript:alert('newline-inject')>

## Valid URL with form feed injection
<https://example.com/safe%0Cjavascript:alert('ff-inject')>

## Valid URL with vertical tab injection
<https://example.com/safe%0Bjavascript:alert('vt-inject')>

## Valid URL with backspace injection
<https://example.com/safe%08javascript:alert('bs-inject')>

## Valid URL with DEL character injection
<https://example.com/safe%7Fjavascript:alert('del-inject')>

## Valid URL with high bit characters
<https://example.com/safe%80javascript:alert('high-bit')>

## Valid URL with non-ASCII percent encoding
<https://example.com/safe%C2%A0javascript:alert('non-ascii')>

## Valid URL exploiting URL constructor edge cases
<https://example.com/?javascript:alert('url-constructor')>

## Valid URL with scheme-relative reference
<https://example.com//attacker.com/javascript:alert('relative-scheme')>

## Valid URL with authority bypass
<https://example.com\@attacker.com/javascript:alert('authority-bypass')>

## Valid URL with mixed separators
<https://example.com\javascript:alert('mixed-separator')>

## Valid URL with percent-encoded colon
<https://example.com/javascript%3Aalert('encoded-colon')>

## Valid URL with percent-encoded slash
<https://example.com%2Fjavascript:alert('encoded-slash')>

## Valid URL with percent-encoded question mark
<https://example.com/safe%3Fjavascript:alert('encoded-question')>

## Valid URL with percent-encoded hash
<https://example.com/safe%23javascript:alert('encoded-hash')>
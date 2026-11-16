# Advanced Image Prefix Bypass Techniques

## Prefix boundary confusion with similar domains
![](https://allowed-prefix.com.evil.com/bypass.js)
![](https://allowed-prefix-com.evil.com/bypass.js)
![](https://allowed.prefix.com.evil.com/bypass.js)
![](https://allowedprefix.com.evil.com/bypass.js)
![](https://allowed_prefix_com.evil.com/bypass.js)

## Unicode domain spoofing with allowed prefix
![](https://аllowed-prefix.com/bypass.js)
![](https://allowed-рrefix.com/bypass.js)
![](https://allowed-prefiх.com/bypass.js)
![](https://allo‍wed-prefix.com/bypass.js)
![](https://allowed-prefix.co‍m/bypass.js)

## Port-based prefix bypass attempts
![](https://allowed-prefix.com:443@evil.com/bypass.js)
![](https://evil.com:443/allowed-prefix.com/bypass.js)
![](https://allowed-prefix.com:80@attacker.com/bypass.js)
![](https://allowed-prefix.com:0@evil.com/bypass.js)

## IDN homograph with prefix matching
![](https://аӏӏowed-prefix.com/bypass.js)
![](https://allowed-рrеfіх.com/bypass.js) 
![](https://аllowed-prefix.сom/bypass.js)
![](https://allowed-prefix.сom/bypass.js)

## Path traversal from allowed prefix  
![](https://allowed-prefix.com/../../../evil.com/bypass.js)
![](https://allowed-prefix.com/path/../../evil.com/bypass.js)
![](https://allowed-prefix.com/allowed-path/../../../evil.com/bypass.js)
![](https://allowed-prefix.com/allowed/../../../evil.com/bypass.js)

## Encoded path traversal from prefix
![](https://allowed-prefix.com/%2e%2e%2f%2e%2e%2f%2e%2e%2fevil.com/bypass.js)
![](https://allowed-prefix.com/%252e%252e%252f%252e%252e%252f%252e%252e%252fevil.com/bypass.js)
![](https://allowed-prefix.com/..%2f..%2f..%2fevil.com/bypass.js)
![](https://allowed-prefix.com/%c0%ae%c0%ae%c0%afevil.com/bypass.js)

## URL constructor normalization bypass
![](https://allowed-prefix.com\@evil.com/bypass.js)
![](https://allowed-prefix.com%00@evil.com/bypass.js)
![](https://allowed-prefix.com%09@evil.com/bypass.js)
![](https://allowed-prefix.com%0d%0a@evil.com/bypass.js)

## Unicode normalization prefix bypass
![](https://allowed-prefix.com/\u002e\u002e\u002f\u002e\u002e\u002f\u002e\u002e\u002fevil.com/bypass.js)
![](https://allowed-prefix.com/..%c0%af..%c0%af..%c0%afevil.com/bypass.js)
![](https://allowed-prefix.com/..\u2215..\u2215..\u2215evil.com/bypass.js)

## Authority section manipulation
![](https://user:pass@allowed-prefix.com@evil.com/bypass.js)
![](https://allowed-prefix.com:pass@evil.com/bypass.js)
![](https://allowed-prefix.com#@evil.com/bypass.js)

## Subdomain vs path confusion
![](https://sub.allowed-prefix.com@evil.com/bypass.js)
![](https://allowed-prefix.com/sub@evil.com/bypass.js)
![](https://allowed-prefix.com?redirect=evil.com/bypass.js)

## Case sensitivity prefix bypass
![](https://ALLOWED-PREFIX.COM/path/../../evil.com/bypass.js)
![](https://Allowed-Prefix.Com/path/../../evil.com/bypass.js)
![](https://allowed-PREFIX.com/path/../../evil.com/bypass.js)

## Protocol confusion with prefix matching
![](ftp://allowed-prefix.com@evil.com/bypass.js)
![](http://allowed-prefix.com@evil.com/bypass.js)
![](https://allowed-prefix.com:ftp.evil.com/bypass.js)

## Fragment-based bypass attempts
![](https://allowed-prefix.com/safe.jpg#../../evil.com/bypass.js)
![](https://allowed-prefix.com/safe.jpg#javascript:alert('fragment'))
![](https://allowed-prefix.com/safe.jpg#@evil.com/bypass.js)

## Query parameter bypass attempts  
![](https://allowed-prefix.com/safe.jpg?redirect=https://evil.com/bypass.js)
![](https://allowed-prefix.com/safe.jpg?url=../../../evil.com/bypass.js)
![](https://allowed-prefix.com/safe.jpg?callback=javascript:alert('query'))

## Double encoding bypass attempts
![](https://allowed-prefix.com/%25%32%65%25%32%65%25%32%66%25%32%65%25%32%65%25%32%66evil.com/bypass.js)
![](https://allowed-prefix.com/%25252e%25252e%25252f%25252e%25252e%25252f%25252e%25252e%25252fevil.com/bypass.js)

## Mixed separator confusion
![](https://allowed-prefix.com\..\..\evil.com\bypass.js)
![](https://allowed-prefix.com/..\x2f..\x2fevil.com\x2fbypass.js)
![](https://allowed-prefix.com/..%5c..%5cevil.com%5cbypass.js)

## IPv6 address confusion
![](https://[::1@evil.com]/allowed-prefix.com/bypass.js)
![](https://allowed-prefix.com@[::1]/bypass.js)
![](https://[2001:db8::1@evil.com]/bypass.js)

## Internationalized domain bypass
![](https://allowed-prefix.xn--com-8bb@evil.com/bypass.js)
![](https://allowed-рrefix.com/bypass.js)
![](https://аllowed-prefix.сom/bypass.js)

## Whitespace and invisible character bypass
![](https://allowed-prefix.com%20@evil.com/bypass.js)
![](https://allowed-prefix.com　@evil.com/bypass.js)
![](https://allowed-prefix.com\x09@evil.com/bypass.js)
![](https://allowed-prefix.com\u2000@evil.com/bypass.js)

## Null byte injection in prefix matching
![](https://allowed-prefix.com%00@evil.com/bypass.js)
![](https://allowed-prefix.com\x00evil.com/bypass.js)
![](https://allowed-prefix.com%00/../../evil.com/bypass.js)

## URL shortener-style bypass
![](https://allowed-prefix.com/redirect?url=https://evil.com/bypass.js)
![](https://allowed-prefix.com/proxy/https://evil.com/bypass.js)
![](https://allowed-prefix.com/r/aHR0cHM6Ly9ldmlsLmNvbS9ieXBhc3MuanM=)

## JavaScript protocol with prefix  
![](https://allowed-prefix.com/safe.jpg'javascript:alert('prefix-js'))
![](https://allowed-prefix.com/safe.jpg";javascript:alert('prefix-js-semicolon'))
![](https://allowed-prefix.com/safe.jpg);javascript:alert('prefix-js-paren'))

## Data URI with prefix spoofing
![](data:text/html,<base href="https://allowed-prefix.com/"><script>alert('data-base')</script>)
![](data:text/html,<!-- https://allowed-prefix.com/ --><script>alert('data-comment')</script>)

## Blob URL bypass attempts  
![](blob:https://allowed-prefix.com/fake-uuid)
![](blob:null/fake-uuid)
![](blob:about:blank#https://allowed-prefix.com/)

## File protocol with prefix confusion
![](file://allowed-prefix.com@evil.com/bypass.js)
![](file:///C:/allowed-prefix.com/../../evil.com/bypass.js)
![](file://localhost/allowed-prefix.com/../evil.com/bypass.js)

## WebRTC and custom protocol bypass
![](stun:allowed-prefix.com@evil.com:3478)
![](turn:allowed-prefix.com@evil.com:3478)
![](custom-protocol://allowed-prefix.com@evil.com/bypass)

## Scheme-relative with prefix bypass
![](//allowed-prefix.com@evil.com/bypass.js)
![](//allowed-prefix.com:evil.com/bypass.js)
![](//user@allowed-prefix.com:pass@evil.com/bypass.js)

## Advanced encoding combination bypass
![](https://allowed-prefix.com/%u002e%u002e%u002fevil.com/bypass.js)
![](https://allowed-prefix.com/\u002e\u002e\u002f\u002e\u002e\u002fevil.com/bypass.js)
![](https://allowed-prefix.com/%c0%ae%c0%ae%c0%afevil.com/bypass.js)
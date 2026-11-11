# Protocol Confusion Bypass Attempts

## Autolink with protocol case variations
<HTTP://example.com/![test](javascript:alert('http-upper'))>
<Https://example.com/![test](javascript:alert('https-mixed'))>
<HTTPS://EXAMPLE.COM/![test](javascript:alert('all-upper'))>

## Autolink with protocol whitespace injection
<http ://example.com/![test](javascript:alert('space-after-http'))>
<http:// example.com/![test](javascript:alert('space-before-domain'))>
<http://example.com /![test](javascript:alert('space-after-domain'))>

## Autolink with protocol tab injection
<http	://example.com/![test](javascript:alert('tab-protocol'))>

## Autolink with protocol newline injection
<http:
//example.com/![test](javascript:alert('newline-protocol'))>

## Autolink with protocol with extra slashes
<http:///example.com/![test](javascript:alert('triple-slash'))>
<http:////example.com/![test](javascript:alert('quad-slash'))>

## Autolink with protocol without slashes
<http:example.com/![test](javascript:alert('no-slash'))>

## Autolink with protocol with single slash
<http:/example.com/![test](javascript:alert('single-slash'))>

## Autolink with protocol with backslashes
<http:\\example.com/![test](javascript:alert('backslash-protocol'))>
<http:\\/example.com/![test](javascript:alert('mixed-slash'))>

## Autolink with custom protocol schemes
<myprotocol://example.com/![test](javascript:alert('custom-protocol'))>
<x-custom://example.com/![test](javascript:alert('x-custom'))>
<custom123://example.com/![test](javascript:alert('custom-num'))>

## Autolink with data protocol variations
<data:text/html,<img src="x" onerror="alert('data-protocol')">
<data:text/plain,![test](javascript:alert('data-plain'))>
<data:image/svg+xml,<svg onload="alert('data-svg')">

## Autolink with javascript protocol variations
<javascript:alert('direct-js')>
<JavaScript:alert('js-mixed-case')>
<JAVASCRIPT:alert('js-upper')>

## Autolink with vbscript protocol
<vbscript:msgbox('vbs')>
<VBScript:msgbox('vbs-mixed')>

## Autolink with about protocol
<about:blank/![test](javascript:alert('about'))>
<about://blank/![test](javascript:alert('about-slashes'))>

## Autolink with chrome protocol
<chrome://settings/![test](javascript:alert('chrome'))>
<chrome-extension://id/![test](javascript:alert('chrome-ext'))>

## Autolink with moz protocol
<moz-extension://id/![test](javascript:alert('moz'))>
<resource://module/![test](javascript:alert('resource'))>

## Autolink with file protocol
<file:///etc/passwd/![test](javascript:alert('file-abs'))>
<file://localhost/etc/passwd/![test](javascript:alert('file-local'))>
<file:/etc/passwd/![test](javascript:alert('file-rel'))>

## Autolink with blob/filesystem protocols
<blob:https://example.com/uuid/![test](javascript:alert('blob'))>
<filesystem:https://example.com/temporary/![test](javascript:alert('filesystem'))>

## Autolink with websocket protocols
<ws://example.com/![test](javascript:alert('websocket'))>
<wss://example.com/![test](javascript:alert('websocket-secure'))>

## Autolink with network protocols
<ftp://example.com/![test](javascript:alert('ftp'))>
<sftp://example.com/![test](javascript:alert('sftp'))>
<ssh://example.com/![test](javascript:alert('ssh'))>
<telnet://example.com/![test](javascript:alert('telnet'))>

## Autolink with mail protocols
<news:comp.lang.javascript/![test](javascript:alert('news'))>
<nntp://news.example.com/![test](javascript:alert('nntp'))>

## Autolink with protocol smuggling via percent encoding
<htt%70://example.com/![test](javascript:alert('percent-protocol'))>
<java%73cript:alert('percent-js')>

## Autolink with protocol smuggling via unicode
<һttp://example.com/![test](javascript:alert('unicode-h'))>
<јavascript:alert('unicode-j')>

## Autolink with protocol confusion via null bytes
<http%00://example.com/![test](javascript:alert('null-protocol'))>

## Autolink with protocol confusion via control chars
<http\x01://example.com/![test](javascript:alert('control-protocol'))>

## Autolink with protocol-relative URLs
<//example.com/![test](javascript:alert('protocol-relative'))>
<///example.com/![test](javascript:alert('triple-slash-rel'))>

## Autolink with malformed authority
<https:///![test](javascript:alert('no-authority'))>
<https://![test](javascript:alert('no-domain'))>

## Autolink with authority bypass attempts
<https://user:pass@example.com/![test](javascript:alert('user-pass'))>
<https://@example.com/![test](javascript:alert('empty-user'))>
<https://example.com@evil.com/![test](javascript:alert('domain-confusion'))>

## Autolink with port confusion
<https://example.com:443/![test](javascript:alert('explicit-port'))>
<https://example.com:80/![test](javascript:alert('wrong-port'))>
<https://example.com:-1/![test](javascript:alert('negative-port'))>

## Autolink with IPv6 addresses
<https://[::1]/![test](javascript:alert('ipv6-localhost'))>
<https://[2001:db8::1]/![test](javascript:alert('ipv6-addr'))>
<https://[::ffff:192.0.2.1]/![test](javascript:alert('ipv6-mapped'))>

## Autolink with IP address variations
<https://127.0.0.1/![test](javascript:alert('localhost'))>
<https://0x7f000001/![test](javascript:alert('hex-ip'))>
<https://2130706433/![test](javascript:alert('decimal-ip'))>
<https://0177.0.0.1/![test](javascript:alert('octal-ip'))>
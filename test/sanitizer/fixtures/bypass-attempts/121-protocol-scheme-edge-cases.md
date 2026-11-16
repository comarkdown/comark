# Protocol Scheme Edge Cases

## Unusual but valid protocol schemes
![](about:alert('about'))
![](blob:alert('blob'))  
![](filesystem:alert('filesystem'))
![](intent:alert('intent'))
![](chrome:alert('chrome'))
![](chrome-extension:alert('chrome-ext'))
![](moz-extension:alert('moz-ext'))
![](resource:alert('resource'))
![](jar:alert('jar'))

## Protocol with numbers and special chars
![](h2:alert('h2'))
![](http2:alert('http2'))
![](tcp+ssl:alert('tcp-ssl'))
![](x-custom-1:alert('numbered'))
![](custom-scheme.v2:alert('dotted'))

## Very long protocol names
![](verylongprotocolnamethatmightcauseissues:alert('long-protocol'))
![](a123456789012345678901234567890:alert('long-alphanum'))

## Protocol case variations
![](HTTP:alert('http-upper'))
![](hTTp:alert('http-mixed'))
![](ｈttp:alert('fullwidth-h'))

## Protocols that look like legitimate ones
![](httpx:alert('httpx'))
![](https-custom:alert('https-custom'))
![](httpsafe:alert('httpsafe'))
![](safehttps:alert('safehttps'))

## Empty or minimal protocols
![](:alert('empty-protocol'))
![](a:alert('single-char'))
![](x:alert('x-protocol'))

## Protocol with unicode characters  
![](ｊａｖａｓｃｒｉｐｔ:alert('fullwidth'))
![](𝒿𝒶𝓋𝒶𝓈𝒸𝓇𝒾𝓅𝓉:alert('math-script'))

## Protocols ending in suspicious patterns
![](http-js:alert('http-js'))
![](safe-javascript:alert('safe-js'))
![](java-script:alert('java-script'))

## Protocol confusion with authority
![](javascript://safe.com:alert('js-authority'))
![](data://text/html:alert('data-authority'))
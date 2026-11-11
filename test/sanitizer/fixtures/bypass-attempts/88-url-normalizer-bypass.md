# URL Normalizer Bypass Attempts

## URLs that bypass normalizer length limits
![test](https://example.com/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa)

## URLs with null bytes that survive normalization
![test](https://example.com/image.jpg%00javascript:alert('null'))

## URLs with path traversal after normalization
![test](https://example.com/safe/../../../javascript:alert('traversal'))

## URLs with double encoding that survive sanitization
![test](https://example.com/%252E%252E%252Fjavascript:alert('double'))

## URLs with mixed encoding that confuses normalizer
![test](https://example.com/%6A%61v%61script%3Aalert%28%27mixed%27%29)

## URLs with unicode normalization bypass
![test](https://example.com/ｊａｖａｓｃｒｉｐｔ：alert（'unicode'）)

## URLs with IDN homograph attacks
![test](https://еxample.com/javascript:alert('homograph'))

## URLs with Punycode bypass
![test](https://xn--e1afmkfd.xn--p1ai/javascript:alert('punycode'))

## URLs with case variations that bypass checks
![test](JAVASCRIPT:alert('upper'))
![test](JavaScript:Alert('mixed'))

## URLs with protocol-relative schemes
![test](//javascript:alert('protocol-relative'))

## URLs with data URIs that bypass checks
![test](data:text/html,<script>alert('data-uri')</script>)

## URLs with blob schemes
![test](blob:javascript:alert('blob'))

## URLs with unusual but valid schemes that bypass filtering
![test](ftp://evil.com/javascript:alert('ftp'))
![test](file:///etc/passwd)

## URLs with IP addresses in different formats
![test](https://127.0.0.1/javascript:alert('ip'))
![test](https://0x7f000001/javascript:alert('hex-ip'))
![test](https://2130706433/javascript:alert('decimal-ip'))

## URLs with IPv6 that bypass checks
![test](https://[::1]/javascript:alert('ipv6'))

## URLs with authority bypass using @
![test](https://safe.com@evil.com/javascript:alert('authority'))

## URLs with port bypass
![test](https://example.com:0/javascript:alert('port-zero'))

## URLs with fragment bypass
![test](https://example.com/safe#javascript:alert('fragment'))

## URLs with query parameter bypass
![test](https://example.com/safe?redirect=javascript:alert('query'))

## URLs with backslashes instead of forward slashes
![test](https:\\example.com\javascript:alert('backslash'))

## URLs with multiple slashes
![test](https://example.com///javascript:alert('multi-slash'))

## URLs with encoded dangerous characters
![test](https://example.com/%6A%61%76%61%73%63%72%69%70%74%3A%61%6C%65%72%74%28%27%65%6E%63%6F%64%65%64%27%29)
# Image URL Normalization Bypass

## URL length exactly at limit edge case
![test](https://example.com/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa.jpg)

## URL fragments that might survive normalization
![test](https://example.com/image.jpg#javascript:alert('fragment'))
![test](https://example.com/image.jpg#<script>alert('fragment')</script>)

## URLs with unusual but valid schemes
![test](ftp://example.com/image.jpg)
![test](file:///etc/passwd)
![test](blob:https://example.com/uuid)

## URL with embedded null bytes after normalization
![test](https://example.com/image.jpg%00javascript:alert('null'))

## URLs that might bypass origin checks
![test](https://example.com.evil.com/image.jpg)
![test](https://example.com@evil.com/image.jpg)

## Unicode normalization attacks in domains
![test](https://еxample.com/image.jpg)
![test](https://example․com/image.jpg)

## URL with IDN homographs
![test](https://еxаmplе.com/image.jpg)
![test](https://аpple.com/image.jpg)

## URL with Punycode
![test](https://xn--e1afmkfd.xn--p1ai/image.jpg)

## URL with unusual ports
![test](https://example.com:0/image.jpg)
![test](https://example.com:65536/image.jpg)
![test](https://example.com:-1/image.jpg)

## URL with IPv4 variations
![test](https://127.1/image.jpg)
![test](https://2130706433/image.jpg)
![test](https://0177.0.0.1/image.jpg)

## URL with IPv6 edge cases
![test](https://[::]/image.jpg)
![test](https://[::ffff:127.0.0.1]/image.jpg)
![test](https://[0:0:0:0:0:0:0:1]/image.jpg)

## URL with percent-encoded restricted characters
![test](https://example.com/image%21.jpg)
![test](https://example.com/image%28%29.jpg)
![test](https://example.com/image%5B%5D.jpg)

## URL with double percent encoding
![test](https://example.com/%252E%252E/image.jpg)

## URL with directory traversal after normalization
![test](https://example.com/safe/../../../etc/passwd)
![test](https://example.com/safe/%2E%2E/%2E%2E/etc/passwd)

## URL with case variations in scheme
![test](HTTP://example.com/image.jpg)
![test](hTTp://example.com/image.jpg)

## URL with mixed separators
![test](https://example.com\\image.jpg)
![test](https://example.com\\/image.jpg)
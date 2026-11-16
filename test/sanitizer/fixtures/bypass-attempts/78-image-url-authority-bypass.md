# Image URL Authority Bypass

## Username injection in image URLs
![test](https://javascript:alert('user')@safe.com/img.jpg)
![test](https://user:javascript:alert('pass')@safe.com/img.jpg)

## IP address spoofing
![test](https://127.0.0.1@evil.com/img.jpg)
![test](https://0x7f000001@evil.com/img.jpg)
![test](https://2130706433@evil.com/img.jpg)

## Port confusion
![test](https://safe.com:80@evil.com/img.jpg)
![test](https://safe.com:443@evil.com/img.jpg)

## IPv6 confusion
![test](https://[::1]@evil.com/img.jpg)
![test](https://[2001:db8::1]@evil.com/img.jpg)

## Subdomain confusion
![test](https://safe.com.evil.com/img.jpg)
![test](https://safe-com.evil.com/img.jpg)

## Domain with embedded credentials
![test](https://safe%2Ecom@evil.com/img.jpg)
![test](https://safe.com%40evil.com/img.jpg)

## International domain names (IDN)
![test](https://sаfe.com/img.jpg)
![test](https://ѕafe.com/img.jpg)

## URL with backslashes
![test](https:\\safe.com\img.jpg)
![test](https://safe.com\..\..\evil.com\img.jpg)

## Double slash confusion
![test](https://safe.com//evil.com/img.jpg)
![test](https://safe.com///evil.com/img.jpg)

## Path traversal in authority
![test](https://safe.com/../../../evil.com/img.jpg)
![test](https://safe.com/..%2F..%2F..%2Fevil.com/img.jpg)

## Authority with special characters
![test](https://safe.com;evil.com/img.jpg)
![test](https://safe.com?evil.com/img.jpg)
![test](https://safe.com#evil.com/img.jpg)

## Encoded authority separators
![test](https://safe.com%2Fevil.com/img.jpg)
![test](https://safe.com%3Aevil.com/img.jpg)

## Multiple @ symbols
![test](https://user@safe.com@evil.com/img.jpg)
![test](https://user@@evil.com/img.jpg)
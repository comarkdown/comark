# URL Normalizer Edge Cases and Bypass Attempts

## Test 1: URL constructor edge cases
![test](https://example.com:65536/path)
![test](https://example.com:-1/path)

## Test 2: URL with unusual port formats
![test](https://example.com:0x50/path)
![test](https://example.com:080/path)

## Test 3: URL with malformed authority section
![test](https://user:pass@:80/path)
![test](https://user@/path)

## Test 4: IPv6 address variations
![test](https://[::ffff:127.0.0.1]/path)
![test](https://[2001:db8::1%25lo0]/path)

## Test 5: URL with percent-encoding edge cases
![test](https://example.com/%2e%2e%2f%2e%2e%2fjavascript:alert)
![test](https://example.com/%252e%252e%252fjavascript:alert)

## Test 6: URL normalization bypass via mixed encoding
![test](https://example.com/\u002e\u002e\u002fjavascript:alert)

## Test 7: URL with bidirectional text attack
![test](https://example.com/path‮javascript:alert)

## Test 8: URL with homograph characters
![test](https://еxample.com/path)
![test](https://example.ⅽom/path)

## Test 9: URL with escaped characters that confuse normalization
![test](https://example.com/path\!test)
![test](https://example.com/path\(test\))

## Test 10: URL length limit bypass via encoding
![test](https://example.com/%41%42%43%44%45%46%47%48%49%4a%4b%4c%4d%4e%4f%50%51%52%53%54%55%56%57%58%59%5a%61%62%63%64%65%66%67%68%69%6a%6b%6c%6d%6e%6f%70%71%72%73%74%75%76%77%78%79%7a)

## Test 11: Default origin confusion
![test](//evil.com/path)
![test](/path/../../../evil.com/path)

## Test 12: URL with fragment that exceeds length
![test](https://example.com/short#aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa)

## Test 13: URL with query parameter overflow
![test](https://example.com/path?param=aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa)

## Test 14: URL with unusual but valid schemes
![test](ldap://example.com/path)
![test](gopher://example.com/path)

## Test 15: URL with case variations in scheme
![test](HTTP://example.com/path)
![test](HtTpS://example.com/path)

## Test 16: URL with international domain name
![test](https://тест.рф/path)
![test](https://测试.中国/path)

## Test 17: URL constructor throws but becomes valid after processing
![test]([object Object])
![test](${alert('xss')})

## Test 18: URL with file system path injection
![test](https://example.com/path/../../etc/passwd)
![test](https://example.com/path/..%2f..%2fetc%2fpasswd)

## Test 19: URL with Windows path injection
![test](https://example.com/path/..\\..\\windows\\system32)

## Test 20: URL with unusual authority parsing
![test](https://user:pass@example.com@evil.com/path)
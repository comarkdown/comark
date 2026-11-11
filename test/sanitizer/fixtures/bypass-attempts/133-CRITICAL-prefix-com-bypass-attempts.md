# 🚨 CRITICAL: prefix.com/prefix/ Specific Bypass Attempts

## Root Cause Analysis
Testing specifically for URLs that start with "https://prefix.com/" but do NOT start with "https://prefix.com/prefix/" - the exact attack vector described.

## Direct Path Traversal from prefix.com
![](https://prefix.com/../../../evil.com/direct-traverse.js)
![](https://prefix.com/../../evil.com/double-traverse.js)
![](https://prefix.com/../../../../evil.com/deep-traverse.js)

## Encoded Path Traversal from prefix.com  
![](https://prefix.com/%2e%2e%2f%2e%2e%2f%2e%2e%2fevil.com/url-encoded.js)
![](https://prefix.com/..%252f..%252fevil.com/double-encoded.js)
![](https://prefix.com/%252e%252e%252f%252e%252e%252fevil.com/triple-encoded.js)

## Path Segment Confusion
![](https://prefix.com/notprefix/../../../evil.com/fake-prefix.js)
![](https://prefix.com/prefi/../../../evil.com/partial-match.js)
![](https://prefix.com/prefix-fake/../../../evil.com/suffix-confuse.js)
![](https://prefix.com/prefix2/../../../evil.com/variant-confuse.js)

## Directory Boundary Attacks
![](https://prefix.com/prefix/../../../evil.com/escape-from-prefix.js)
![](https://prefix.com/prefix/../../evil.com/relative-escape.js)
![](https://prefix.com/prefix/../other/../../../evil.com/complex-navigate.js)

## Unicode and Encoding in Paths
![](https://prefix.com/prefiх/../../../evil.com/cyrillic-x-in-prefix.js)
![](https://prefix.com/рrefix/../../../evil.com/cyrillic-p-in-prefix.js)
![](https://prefix.com/prefix%c0%af../../../evil.com/unicode-slash-bypass.js)

## Null Byte and Control Character Injection
![](https://prefix.com/prefix%00/../../../evil.com/null-truncate.js)
![](https://prefix.com/prefix%00fake/../../evil.com/null-confuse-path.js)
![](https://prefix.com/prefix\x00/../../../evil.com/control-char.js)

## Fragment and Query Parameter Bypass
![](https://prefix.com/safe.html?../../evil.com/query-traverse.js)
![](https://prefix.com/safe.html#../../evil.com/fragment-traverse.js)
![](https://prefix.com/prefix?x=/../../../evil.com/query-prefix-escape.js)

## Protocol Injection in Paths
![](https://prefix.com/javascript:alert('injected')/fake-path.js)
![](https://prefix.com/data:text/html,<script>alert(1)</script>/fake.js)
![](https://prefix.com/vbscript:msgbox("xss")/fake-path.js)

## Authority Confusion with Prefix Domain
![](https://user:pass@prefix.com@evil.com/prefix/auth-hijack.js)
![](https://prefix.com@evil.com/prefix/at-redirect.js)
![](https://prefix.com:evil.com/prefix/port-confuse.js)

## Mixed Case and Whitespace
![](https://PREFIX.COM/PREFIX/../../evil.com/case-bypass.js)
![](https://prefix.com/PREFIX/../../evil.com/mixed-case.js)
![](https://prefix.com/prefix /../../evil.com/space-suffix.js)
![](https://prefix.com/ prefix/../../evil.com/space-prefix.js)
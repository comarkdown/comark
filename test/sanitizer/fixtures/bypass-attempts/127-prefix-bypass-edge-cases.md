# Prefix Bypass Edge Cases

## Prefix confusion with similar domains
![](https://prefix.com.evil.com/prefix/attack.js)
![](https://prefix.com-evil.com/prefix/hyphen-confuse.js)
![](https://prefixcom.evil.com/prefix/no-dot-confuse.js)
![](https://prefix_com.evil.com/prefix/underscore-confuse.js)

## Authority confusion with @ symbol
![](https://prefix.com@evil.com/prefix/authority-hijack.js)
![](https://user:pass@prefix.com@evil.com/prefix/auth-confuse.js)
![](https://prefix.com%40evil.com/prefix/encoded-at.js)
![](https://prefix.com＠evil.com/prefix/fullwidth-at.js)

## Port-based prefix bypass
![](https://prefix.com:8080@evil.com/prefix/port-confuse.js)
![](https://prefix.com:password@evil.com/prefix/port-as-password.js)
![](https://evil.com:80/prefix.com/prefix/reversed-authority.js)

## Protocol confusion with prefix
![](https://prefix.com/prefix/javascript:alert('injection'))
![](https://prefix.com/prefix/data:text/html,<script>alert(1)</script>)
![](https://prefix.com/prefix/vbscript:msgbox("xss"))

## Query parameter bypass attempts
![](https://prefix.com/prefix/?redirect=https://evil.com/attack.js)
![](https://prefix.com/prefix/safe.jpg?x=/../../../evil.com/traversal.js)
![](https://prefix.com/prefix/image.png#https://evil.com/fragment.js)

## Fragment-based bypass attempts
![](https://prefix.com/prefix/#../../evil.com/fragment-traverse.js)
![](https://prefix.com/prefix/safe.html#javascript:alert('xss'))
![](https://prefix.com/prefix/image.png#data:text/html,<script>alert(1)</script>)
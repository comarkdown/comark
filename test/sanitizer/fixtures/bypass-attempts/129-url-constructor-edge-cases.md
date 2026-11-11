# URL Constructor Edge Cases and Bypasses

## IPv6 address confusion
![](https://[prefix.com]/prefix/ipv6-bracket-confuse.js)
![](https://prefix.com/prefix/../../../[::1]/ipv6-traverse.js)
![](https://[2001:db8::prefix.com]/prefix/spoofed-ipv6.js)

## URL constructor quirks with special characters
![](https://prefix.com/prefix/../../../evil.com:80../port-traversal.js)
![](https://prefix.com/prefix/../../\..\evil.com/mixed-separators.js)
![](https://prefix.com/prefix/../../evil.com:/../port-path-confuse.js)

## Double URL encoding edge cases
![](https://prefix.com/prefix/..%252F..%252Fevil.com/double-percent.js)
![](https://prefix.com/prefix/%252e%252e%252f%252e%252e%252fevil.com/double-dot-slash.js)
![](https://prefix.com/prefix/..%25252F..%25252Fevil.com/triple-encoding.js)

## Authority parsing edge cases
![](https://prefix.com/../../../@evil.com/prefix/at-authority.js)
![](https://prefix.com/prefix/../../evil.com:@/port-at.js)
![](https://://prefix.com/prefix/../../evil.com/empty-protocol.js)

## Path normalization edge cases
![](https://prefix.com/prefix/.././.././evil.com/mixed-dots.js)
![](https://prefix.com/prefix/.//..//../evil.com/current-parent-mix.js)
![](https://prefix.com/prefix//../../evil.com/double-slash-traverse.js)

## URL length manipulation
![](https://prefix.com/prefix/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa/../../../evil.com/length-bypass.js)

## Special protocol handling
![](https://prefix.com/prefix/../../../about:blank/../evil.com/about-protocol.js)
![](https://prefix.com/prefix/../../../blob:null/evil.com/blob-protocol.js)
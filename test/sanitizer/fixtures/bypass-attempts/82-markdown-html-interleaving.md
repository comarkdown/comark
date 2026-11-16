# Markdown HTML Interleaving

## Image inside HTML comment
<!-- ![test](javascript:alert('comment')) -->

## HTML image with markdown inside attributes
<img src="![test](javascript:alert('attr'))" alt="test" />

## Markdown image breaking out of HTML
<div>![test](javascript:alert('escape'))</div>

## HTML img with broken syntax forcing markdown parsing
<img src="incomplete ![test](javascript:alert('incomplete'))

## Mixed markdown and HTML in same line
This is <strong>bold ![test](javascript:alert('mixed'))</strong> text.

## HTML image with markdown-like alt text
<img src="/safe.jpg" alt="![](javascript:alert('alt'))" />

## Markdown image inside HTML tag attributes
<div title="![test](javascript:alert('title'))">Content</div>

## HTML comment containing markdown image
<!-- This is a comment with ![test](javascript:alert('html-comment')) inside -->

## CDATA section with markdown
<![CDATA[![test](javascript:alert('cdata'))]]>

## HTML entities in markdown image URLs
![test](https&#58;//example.com/javascript&#58;alert('entity'))

## Markdown image with HTML-encoded characters
![test](https://example.com/&#106;&#97;&#118;&#97;&#115;&#99;&#114;&#105;&#112;&#116;&#58;alert('encoded'))

## HTML img with markdown reference-style URL
<img src="[malicious]" />

[malicious]: javascript:alert('html-ref')

## Breaking out of HTML context with markdown
<script>
![test](javascript:alert('script-context'))
</script>

## Markdown image inside HTML style
<style>
background: url('![test](javascript:alert('style'))');
</style>

## HTML with unclosed tags and markdown
<div
![test](javascript:alert('unclosed'))

## Markdown inside XML processing instruction
<?xml version="1.0"?>
![test](javascript:alert('xml'))

## HTML with nested markdown parsing
<p>This is a paragraph with ![test](javascript:alert('nested')) image</p>

## Markdown image breaking HTML parsing
<img src="/safe.jpg" alt="test" ![test](javascript:alert('break'))>

## HTML with markdown-like attributes
<img src="/safe.jpg" href="javascript:alert('fake-href')" onclick="alert('click')" />
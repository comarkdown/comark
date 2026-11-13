&lt;img src=x onerror=alert('entity bypass 1')&gt;

&#60;script&#62;alert('numeric entity bypass')&#60;/script&#62;

&#x3C;img src=x onerror=alert('hex entity bypass')&#x3E;

&amp;lt;script&amp;gt;alert('double encoded')&amp;lt;/script&amp;gt;

<img src="x" onerror="alert('raw HTML when skipHtml disabled')">

<!-- This comment should be preserved -->
<!-- <img src=x onerror=alert('comment injection')> -->

<![CDATA[<script>alert('CDATA bypass')</script>]]>

<!DOCTYPE html><script>alert('DOCTYPE bypass')</script>

<style>
body { background: url('javascript:alert("CSS injection")'); }
</style>

<link rel="stylesheet" href="javascript:alert('link injection')">

<base href="javascript:alert('base injection')">

<meta charset="utf-8"><script>alert('meta bypass')</script>

<noscript><script>alert('noscript paradox')</script></noscript>

<template><script>alert('template bypass')</script></template>

<slot><script>alert('slot bypass')</script></slot>

<shadow><script>alert('shadow bypass')</script></shadow>
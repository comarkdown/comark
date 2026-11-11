# HTML Escaping Edge Cases in Custom Escape Function

## Test 1: Mixed HTML entities and markdown dangerous chars
![test](https://example.com/path?param=&lt;&gt;&amp;"'[]():!/())

## Test 2: Nested HTML entities within dangerous characters
![test&lt;script&gt;](https://example.com/image.jpg)

## Test 3: Incomplete HTML entities mixed with dangerous chars
![test&amp](https://example.com/image.jpg)

## Test 4: Hex entity boundary confusion
![test&#x3c;script&#x3e;](https://example.com/image.jpg)

## Test 5: Decimal entity boundary confusion  
![test&#60;script&#62;](https://example.com/image.jpg)

## Test 6: Multiple escaping rounds confusion
![test&amp;amp;lt;script&amp;amp;gt;](https://example.com/image.jpg)

## Test 7: Zero-width characters in dangerous sequences
![test<‌script>](https://example.com/image.jpg)

## Test 8: Combining character attacks
![test≮script>](https://example.com/image.jpg)

## Test 9: UTF-8 overlong encoding simulation
![test<script>](https://example.com/%C0%BCscript%C0%BC)

## Test 10: Surrogate pair in dangerous context
![test\uD83D\uDE08<script>](https://example.com/image.jpg)

## Test 11: Escape function boundary - just before threshold
![test_safe_content](https://example.com/image.jpg)

## Test 12: Escape function boundary - just after threshold
![test<](https://example.com/image.jpg)

## Test 13: Multiple dangerous chars scattered
![t<e>s&t"a'l[t]:t=e/s!t()](https://example.com/image.jpg)

## Test 14: Dangerous chars at string boundaries
<![test](https://example.com/image.jpg)>

## Test 15: Nested markdown in alt with dangerous chars
![**bold<script>alert**](https://example.com/image.jpg)
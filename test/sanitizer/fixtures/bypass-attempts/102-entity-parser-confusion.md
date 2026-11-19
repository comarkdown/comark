# Entity Encoding Parser Confusion

## Test 1: Triple Entity Encoding
[Click here](&26;26;26;3a;javascript&26;26;26;3a;alert&26;26;26;28;1&26;26;26;29;)

## Test 2: Mixed Entity and URL Encoding
[Click here](java%73cript&3a;alert&28;1&29;)

## Test 3: Entity Encoding in Reference Links
[link]: &26;3a;javascript&26;3a;alert&26;28;1&26;29;
[Click here][link]

## Test 4: Malformed Entity Chains
[Click here](&amp;&amp;&amp;3a;javascript&amp;&amp;&amp;3a;alert&amp;&amp;&amp;28;1&amp;&amp;&amp;29;)

## Test 5: Entity Encoding Boundary Confusion
[Click here](javascrip&74;&3a;ale&72;t&28;1&29;)

## Test 6: Nested Entity Encoding in Markdown
[![&26;3a;javascript&26;3a;alert&26;28;1&26;29;](image.png)](https://example.com)

## Test 7: Entity Encoding with Markdown Escapes
[Click here](javascript\&3a;alert\&28;1\&29;)

## Test 8: Autolink Entity Confusion
<javascript&3a;alert&28;1&29;>

## Test 9: HTML Comment with Entity Encoding
<!-- &26;3a;javascript&26;3a;alert&26;28;1&26;29; -->
[Click here](#)

## Test 10: Entity Encoding in HTML Attributes
<a href="javascript&3a;alert&28;1&29;" title="test">Click</a>
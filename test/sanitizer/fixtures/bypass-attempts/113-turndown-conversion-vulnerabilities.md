# Turndown Conversion Edge Cases

## Test 1: HTML5 void elements confusion
![test](https://example.com/image.jpg)<area>
![test](https://example.com/image.jpg)<base href="javascript:alert('base')">
![test](https://example.com/image.jpg)<track kind="captions" src="javascript:alert('track')">

## Test 2: Self-closing tag variations
![test](https://example.com/image.jpg)<input type="image" src="javascript:alert('input')" />
![test](https://example.com/image.jpg)<source src="javascript:alert('source')" />

## Test 3: Script injection via turndown options manipulation
![test](https://example.com/image.jpg)
<div data-turndown-options='{"fence":"```","emDelimiter":"*<script>alert(1)</script>*"}'>test</div>

## Test 4: Turndown linkStyle exploitation
[<script>alert('linkStyle')</script>](https://example.com/safe)

## Test 5: Turndown fence character injection
```<script>alert('fence')</script>
console.log('code');
```

## Test 6: GFM plugin bypass via table injection
| Column 1<script>alert('table')</script> | Column 2 |
|---|---|
| data | data |

## Test 7: Turndown heading style injection
# Heading<script>alert('heading')</script>

## Test 8: Link reference style manipulation
[text<script>alert('ref')</script>][ref]

[ref]: https://example.com/safe

## Test 9: Strong delimiter injection
**bold<script>alert('strong')</script>**

## Test 10: Em delimiter injection
*em<script>alert('em')</script>*

## Test 11: Turndown rule priority confusion
<img src="javascript:alert('img')" onerror="alert('onerror')" />
![alt](javascript:alert('markdown'))

## Test 12: Nested conversion state confusion
<a href="javascript:alert('outer')">
  ![inner](javascript:alert('inner'))
</a>

## Test 13: Turndown boundary condition - content at edge
<p>content</p>![test](javascript:alert('boundary'))

## Test 14: Complex nested structure conversion
<blockquote>
  <p>Quote with ![image](javascript:alert('nested')) inside</p>
  <ul>
    <li>List item with [link](javascript:alert('list-link'))</li>
  </ul>
</blockquote>

## Test 15: GFM strikethrough with injection
~~strikethrough<script>alert('strike')</script>~~
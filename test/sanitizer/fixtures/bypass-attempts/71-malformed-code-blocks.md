```javascript
var x = "```";
alert('break out');
```

```
<script>alert('no language')</script>
```
<img src="javascript:alert('after block')">

```html
<script>
```
<script>alert('broken end')</script>

`inline code with ` backtick <script>alert('xss')</script>

    ```
    fake indented fenced block
    ```
<script>alert('after fake block')</script>
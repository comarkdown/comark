```javascript
alert('xss')
```
<script>alert('This should be escaped')</script>

`code` <img src="x" onerror="alert('xss')">

```html
</script><script>alert('break out')</script>
```

    <script>alert('indented code')</script>
<script>alert('This should be escaped too')</script>
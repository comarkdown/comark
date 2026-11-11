![alt with `code`](javascript:alert('xss'))

[link with `code`](javascript:alert('xss'))

```javascript
// This is safe code
console.log("test");
```
![](javascript:alert('after code'))

`<script>alert('inline')</script>` but this is dangerous: <script>alert('real')</script>

```markdown
![dangerous in code](javascript:alert('safe'))
[dangerous in code](javascript:alert('safe'))
```
![dangerous outside](javascript:alert('dangerous'))

    <img src="x" onerror="alert('indented')">
<img src="x" onerror="alert('not indented')">
```html
<script>alert('code')</script>
```<script>alert('immediate after')</script>

```
multiline
code
```
<img src="x" onerror="alert('after multiline')">

Text before `inline` <script>alert('between')</script> `more inline` text.

```css
body { background: url('javascript:alert()'); }
```
<style>body { background: url('javascript:alert()'); }</style>

~~~javascript
alert('tildes');
~~~
<script>alert('after tildes')</script>
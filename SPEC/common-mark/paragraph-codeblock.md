---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input 

```md
```javascript
function hello() {
  console.log("Hello, World!");
}
```
```

## AST

```json
{
  "type": "minimark",
  "value": [
    [
      "pre",
      {},
      [
        "code",
        {
          "class": "language-javascript"
        },
        "function hello() {\n  console.log(\"Hello, World!\");\n}\n"
      ]
    ]
  ]
}
```

## HTML

```html
<pre><code class="language-javascript">function hello() {
  console.log("Hello, World!");
}
</code></pre>
```

## Markdown

```md
```javascript
function hello() {
  console.log("Hello, World!");
}
```
```


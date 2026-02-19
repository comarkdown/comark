---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
options:
  highlight: false
---

## Input

```md
```
function hello() {
  console.log("Hello, World!");
}
```
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "pre",
      {},
      [
        "code",
        {},
        "function hello() {\n  console.log(\"Hello, World!\");\n}"
      ]
    ]
  ]
}
```

## HTML

```html
<pre><code>function hello() {
  console.log("Hello, World!");
}</code></pre>
```

## Markdown

```md
```
function hello() {
  console.log("Hello, World!");
}
```
```

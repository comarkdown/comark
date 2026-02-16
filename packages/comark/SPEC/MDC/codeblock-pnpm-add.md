---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
```bash
pnpm add comark
```
```

## AST

```json
{
  "type": "comark",
  "value": [
    [
      "pre",
      {
        "language": "bash"
      },
      [
        "code",
        {
          "class": "language-bash"
        },
        "pnpm add comark"
      ]
    ]
  ]
}
```

## HTML

```html
<pre language="bash"><code class="language-bash">pnpm add comark</code></pre>
```

## Markdown

```md
```bash
pnpm add comark
```
```

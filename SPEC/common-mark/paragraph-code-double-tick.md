---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input 

```md
``Use `code` in your Markdown file.``
```

## AST

```json
{
  "type": "minimark",
  "value": [
    [
      "p",
      {},
      [
        "code",
        {},
        "Use `code` in your Markdown file."
      ]
    ]
  ]
}
```

## HTML

```html
<p><code>Use `code` in your Markdown file.</code></p>
```

## Markdown

```md
``Use `code` in your Markdown file.``
```


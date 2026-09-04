---
options:
  autoUnwrap: false
---

## Input

```md
<ai-thinking>
**bold**
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "ai-thinking",
      {
        "$": {
          "html": 1,
          "block": 0
        }
      },
      [
        "p",
        {},
        [
          "strong",
          {},
          "bold"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<ai-thinking>
  <p><strong>bold</strong></p>
</ai-thinking>
```

## Markdown

```md
<ai-thinking>

**bold**

</ai-thinking>
```

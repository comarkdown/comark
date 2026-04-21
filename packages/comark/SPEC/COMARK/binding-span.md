---
options:
  plugins:
    - binding
---

## Input

```md
[highlighted {{ color }} text]{.glow}
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      {},
      [
        "span",
        {
          "class": "glow"
        },
        "highlighted ",
        [
          "binding",
          {
            ":value": "color"
          }
        ],
        " text"
      ]
    ]
  ]
}
```

## HTML

```html
<p><span class="glow">highlighted <binding value="color"></binding> text</span></p>
```

## Markdown

```md
[highlighted :binding{:value="color"} text]{.glow}
```

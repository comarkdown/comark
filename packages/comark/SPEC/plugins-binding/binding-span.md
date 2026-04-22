---
options:
  plugins:
    - binding
---

## Input

```md
---
color: red
---

[highlighted {{ frontmatter.color }} text]{.glow}
```

## AST

```json
{
  "frontmatter": {
    "color": "red"
  },
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
            ":value": "frontmatter.color"
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
<p><span class="glow">highlighted red text</span></p>
```

## Markdown

```md
---
color: red
---

[highlighted {{ frontmatter.color }} text]{.glow}
```

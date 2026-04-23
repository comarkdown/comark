---
options:
  plugins:
    - binding
---

## Input

```md
---
label: Quick Start
---

Read the [{{ frontmatter.label }} guide](/docs) today.
```

## AST

```json
{
  "frontmatter": {
    "label": "Quick Start"
  },
  "meta": {},
  "nodes": [
    [
      "p",
      {},
      "Read the ",
      [
        "a",
        {
          "href": "/docs"
        },
        [
          "binding",
          {
            ":value": "frontmatter.label"
          }
        ],
        " guide"
      ],
      " today."
    ]
  ]
}
```

## HTML

```html
<p>Read the <a href="/docs">Quick Start guide</a> today.</p>
```

## Markdown

```md
---
label: Quick Start
---

Read the [{{ frontmatter.label }} guide](/docs) today.
```

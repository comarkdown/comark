---
options:
  plugins:
    - binding
---

## Input

```md
Read the [{{ label }} guide](/docs) today.
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
      "Read the ",
      [
        "a",
        {
          "href": "/docs"
        },
        [
          "binding",
          {
            ":value": "label"
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
<p>Read the <a href="/docs"><binding value="label"></binding> guide</a> today.</p>
```

## Markdown

```md
Read the [:binding{:value="label"} guide](/docs) today.
```

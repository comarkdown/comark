---
options:
  headingIds: false
---

## Input

```md
# Product Documentation {#prod-doc}

## Installation
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "h1",
      {
        "id": "prod-doc"
      },
      "Product Documentation"
    ],
    [
      "h2",
      {},
      "Installation"
    ]
  ]
}
```

## HTML

```html
<h1 id="prod-doc">Product Documentation</h1>
<h2>Installation</h2>
```

## Markdown

```md
# Product Documentation {#prod-doc}

## Installation
```

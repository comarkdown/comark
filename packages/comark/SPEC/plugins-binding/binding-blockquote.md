---
options:
  plugins:
    - binding
---

## Input

```md
---
author:
  name: Rumi
---

> Quote from {{ frontmatter.author.name || anonymous }}.
```

## AST

```json
{
  "frontmatter": {
    "author": {
      "name": "Rumi"
    }
  },
  "meta": {},
  "nodes": [
    [
      "blockquote",
      {},
      "Quote from ",
      [
        "binding",
        {
          ":value": "frontmatter.author.name",
          "defaultValue": "anonymous"
        }
      ],
      "."
    ]
  ]
}
```

## HTML

```html
<blockquote>
  Quote from Rumi.
</blockquote>
```

## Markdown

```md
---
author:
  name: Rumi
---

> Quote from {{ frontmatter.author.name || anonymous }}.
```

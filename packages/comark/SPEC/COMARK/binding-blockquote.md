---
options:
  plugins:
    - binding
---

## Input

```md
> Quote from {{ author.name || anonymous }}.
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "blockquote",
      {},
      "Quote from ",
      [
        "binding",
        {
          ":value": "author.name",
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
  Quote from <binding value="author.name" defaultValue="anonymous"></binding>.
</blockquote>
```

## Markdown

```md
> Quote from :binding{:value="author.name" defaultValue="anonymous"}.
```

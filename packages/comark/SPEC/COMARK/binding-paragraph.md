---
options:
  plugins:
    - binding
---

## Input

```md
Welcome, {{ user.name || guest }}.
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
      "Welcome, ",
      [
        "binding",
        {
          ":value": "user.name",
          "defaultValue": "guest"
        }
      ],
      "."
    ]
  ]
}
```

## HTML

```html
<p>
  Welcome, <binding value="user.name" defaultValue="guest"></binding>.
</p>
```

## Markdown

```md
Welcome, :binding{:value="user.name" defaultValue="guest"}.
```

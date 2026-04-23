---
options:
  plugins:
    - binding
---

## Input

```md
---
user:
  name: Ada
---

Welcome, {{ frontmatter.user.name || guest }}.
```

## AST

```json
{
  "frontmatter": {
    "user": {
      "name": "Ada"
    }
  },
  "meta": {},
  "nodes": [
    [
      "p",
      {},
      "Welcome, ",
      [
        "binding",
        {
          ":value": "frontmatter.user.name",
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
  Welcome, Ada.
</p>
```

## Markdown

```md
---
user:
  name: Ada
---

Welcome, {{ frontmatter.user.name || guest }}.
```

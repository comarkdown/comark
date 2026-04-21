## Input

```md
---
user:
  name: Ada
---

Hello :badge{:label="frontmatter.user.name"}!
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
      "Hello ",
      [
        "badge",
        {
          ":label": "frontmatter.user.name"
        }
      ],
      "!"
    ]
  ]
}
```

## HTML

```html
<p>
  Hello <badge label="Ada"></badge>!
</p>
```

## Markdown

```md
---
user:
  name: Ada
---

Hello :badge{:label="frontmatter.user.name"}!
```

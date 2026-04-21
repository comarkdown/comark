---
options:
  plugins:
    - binding
---

## Input

```md
---
name: Ada
---

## Hello {{ frontmatter.name }}
```

## AST

```json
{
  "frontmatter": {
    "name": "Ada"
  },
  "meta": {},
  "nodes": [
    [
      "h2",
      {
        "id": "hello-binding"
      },
      "Hello ",
      [
        "binding",
        {
          ":value": "frontmatter.name"
        }
      ]
    ]
  ]
}
```

## HTML

```html
<h2 id="hello-binding">
  Hello Ada
</h2>
```

## Markdown

```md
---
name: Ada
---

## Hello {{ frontmatter.name }}
```

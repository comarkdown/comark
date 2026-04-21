---
options:
  plugins:
    - binding
---

## Input

```md
## Hello {{ name }}
```

## AST

```json
{
  "frontmatter": {},
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
          ":value": "name"
        }
      ]
    ]
  ]
}
```

## HTML

```html
<h2 id="hello-binding">
  Hello <binding value="name"></binding>
</h2>
```

## Markdown

```md
## Hello :binding{:value="name"}
```

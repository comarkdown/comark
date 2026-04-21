---
options:
  plugins:
    - binding
---

## Input

```md
- Alice {{ user.age }}
- Bob {{ user.role }}
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "ul",
      {},
      [
        "li",
        {},
        "Alice ",
        [
          "binding",
          {
            ":value": "user.age"
          }
        ]
      ],
      [
        "li",
        {},
        "Bob ",
        [
          "binding",
          {
            ":value": "user.role"
          }
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<ul>
  <li>
    Alice <binding value="user.age"></binding>
  </li>
  <li>
    Bob <binding value="user.role"></binding>
  </li>
</ul>
```

## Markdown

```md
- Alice :binding{:value="user.age"}
- Bob :binding{:value="user.role"}
```

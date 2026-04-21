---
options:
  plugins:
    - binding
---

## Input

```md
---
user:
  age: 30
  role: admin
---

- Alice {{ frontmatter.user.age }}
- Bob {{ frontmatter.user.role }}
```

## AST

```json
{
  "frontmatter": {
    "user": {
      "age": 30,
      "role": "admin"
    }
  },
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
            ":value": "frontmatter.user.age"
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
            ":value": "frontmatter.user.role"
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
    Alice 30
  </li>
  <li>
    Bob admin
  </li>
</ul>
```

## Markdown

```md
---
user:
  age: 30
  role: admin
---

- Alice {{ frontmatter.user.age }}
- Bob {{ frontmatter.user.role }}
```

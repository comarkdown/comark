---
timeout:
  parse: 50ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
- [x] Done
- [ ] todo
```

## AST

```json
{
  "type": "comark",
  "value": [
    [
      "ul",
      {
        "class": "contains-task-list"
      },
      [
        "li",
        {
          "class": "task-list-item"
        },
        [
          "input",
          {
            "class": "task-list-item-checkbox",
            ":checked": "true",
            ":disabled": "true",
            "type": "checkbox"
          }
        ],
        " Done"
      ],
      [
        "li",
        {
          "class": "task-list-item"
        },
        [
          "input",
          {
            "class": "task-list-item-checkbox",
            ":disabled": "true",
            "type": "checkbox"
          }
        ],
        " todo"
      ]
    ]
  ]
}
```

## HTML

```html
<ul class="contains-task-list">
  <li class="task-list-item">
    <input class="task-list-item-checkbox" checked disabled type="checkbox" /> Done
  </li>
  <li class="task-list-item">
    <input class="task-list-item-checkbox" disabled type="checkbox" /> todo
  </li>
</ul>
```

## Markdown

```md
- [x] Done
- [ ] todo
```

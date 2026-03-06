---
timeout:
  parse: 50ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
- [x] Done
- [x] Done
- [ ] todo
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
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
            "type": "checkbox",
            ":disabled": "true",
            ":checked": "true"
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
            "type": "checkbox",
            ":disabled": "true",
            ":checked": "true"
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
    <input class="task-list-item-checkbox" type="checkbox" disabled checked /> Done
  </li>
  <li class="task-list-item">
    <input class="task-list-item-checkbox" type="checkbox" disabled checked /> Done
  </li>
  <li class="task-list-item">
    <input class="task-list-item-checkbox" type="checkbox" disabled /> todo
  </li>
</ul>
```

## Markdown

```md
- [x] Done
- [x] Done
- [ ] todo
```

## Input

```md
- [ ] Task list item {attr="value"}
- [x] Task list item {attr2="value2"}
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
          "class": "task-list-item",
          "attr": "value"
        },
        [
          "input",
          {
            "class": "task-list-item-checkbox",
            "type": "checkbox",
            ":disabled": "true"
          }
        ],
        " Task list item"
      ],
      [
        "li",
        {
          "class": "task-list-item",
          "attr2": "value2"
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
        " Task list item"
      ]
    ]
  ]
}
```

## HTML

```html
<ul class="contains-task-list">
  <li class="task-list-item" attr="value">
    <input class="task-list-item-checkbox" type="checkbox" disabled /> Task list item
  </li>
  <li class="task-list-item" attr2="value2">
    <input class="task-list-item-checkbox" type="checkbox" disabled checked /> Task list item
  </li>
</ul>
```

## Markdown

```md
- [ ] Task list item {attr="value"}
- [x] Task list item {attr2="value2"}
```

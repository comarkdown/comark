## Input

```md
- [ ] Option one

  > Why this is wrong.

- [x] Option two

  More about it.
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
          "p",
          {},
          [
            "input",
            {
              "class": "task-list-item-checkbox",
              "type": "checkbox",
              ":disabled": "true"
            }
          ],
          " Option one"
        ],
        [
          "blockquote",
          {},
          "Why this is wrong."
        ]
      ],
      [
        "li",
        {
          "class": "task-list-item"
        },
        [
          "p",
          {},
          [
            "input",
            {
              "class": "task-list-item-checkbox",
              "type": "checkbox",
              ":disabled": "true",
              ":checked": "true"
            }
          ],
          " Option two"
        ],
        [
          "p",
          {},
          "More about it."
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<ul class="contains-task-list">
  <li class="task-list-item">
    <p>
      <input class="task-list-item-checkbox" type="checkbox" disabled> Option one
    </p>
    <blockquote>
      Why this is wrong.
    </blockquote>
  </li>
  <li class="task-list-item">
    <p>
      <input class="task-list-item-checkbox" type="checkbox" disabled checked> Option two
    </p>
    <p>More about it.</p>
  </li>
</ul>
```

## Markdown

```md
- [ ] Option one
  > Why this is wrong.
- [x] Option two

  More about it.
```

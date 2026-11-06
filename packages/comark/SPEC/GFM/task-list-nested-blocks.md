## Input

```md
- [ ] Option one
  > Why this is wrong.
- [x] Option two
  ```js
  x
  ```
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
          "pre",
          {
            "language": "js"
          },
          [
            "code",
            {
              "class": "language-js"
            },
            "x"
          ]
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
    <pre data-language="js"><code class="language-js">x</code></pre>
  </li>
</ul>
```

## Markdown

```md
- [ ] Option one
  > Why this is wrong.
- [x] Option two
  ```js
  x
  ```
```

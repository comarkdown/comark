## Input

```md
- Item with quote:

  > Quote level 1

  - Nested item with quote:

    > Quote level 2
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
        "Item with quote:",
        [
          "blockquote",
          {},
          "Quote level 1"
        ],
        [
          "ul",
          {},
          [
            "li",
            {},
            "Nested item with quote:",
            [
              "blockquote",
              {},
              "Quote level 2"
            ]
          ]
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
    Item with quote:
    <blockquote>
      Quote level 1
    </blockquote>
    <ul>
      <li>
        Nested item with quote:
        <blockquote>
          Quote level 2
        </blockquote>
      </li>
    </ul>
  </li>
</ul>
```

## Markdown

```md
- Item with quote:
  > Quote level 1

  - Nested item with quote:
    > Quote level 2
```

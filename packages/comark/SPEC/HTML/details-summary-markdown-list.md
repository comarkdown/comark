## Input

```md
<details>
<summary>Sum</summary>

- Body **b**
- two

</details>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "details",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      },
      [
        "summary",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        "Sum"
      ],
      [
        "ul",
        {},
        [
          "li",
          {},
          "Body ",
          [
            "strong",
            {},
            "b"
          ]
        ],
        [
          "li",
          {},
          "two"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<details>
  <summary>Sum</summary>
  <ul>
    <li>Body <strong>b</strong></li>
    <li>two</li>
  </ul>
</details>
```

## Markdown

```md
<details>

<summary>Sum</summary>

- Body **b**
- two

</details>
```

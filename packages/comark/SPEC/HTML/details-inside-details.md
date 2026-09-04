## Input

```md
<details>
<summary>Top</summary>

<details>
<summary>Nested</summary>

Nested content

</details>

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
        "Top"
      ],
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
          "Nested"
        ],
        "Nested content"
      ]
    ]
  ]
}
```

## HTML

```html
<details>
  <summary>Top</summary>
  <details>
    <summary>Nested</summary>Nested content
  </details>
</details>
```

## Markdown

```md
<details>
<summary>Top</summary><details>
<summary>Nested</summary>

Nested content
</details>
</details>
```

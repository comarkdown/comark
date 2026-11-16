## Input

```md
- text <x-card>

  **a**

  </x-card>

last
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
        "text ",
        [
          "x-card",
          {
            "$": {
              "html": 1,
              "block": 0
            }
          },
          [
            "strong",
            {},
            "a"
          ]
        ]
      ]
    ],
    [
      "p",
      {},
      "last"
    ]
  ]
}
```

## HTML

```html
<ul>
  <li>
    text <x-card><strong>a</strong></x-card>
  </li>
</ul>
<p>last</p>
```

## Markdown

```md
- text <x-card>**a**</x-card>

last
```

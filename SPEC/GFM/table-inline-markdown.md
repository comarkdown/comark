---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
| Formatting | Example |
|------------|---------|
| **Bold** | `code` |
| *Italic* | [link](url) |
```

## AST

```json
{
  "type": "minimark",
  "value": [
    [
      "table",
      {},
      [
        "thead",
        {},
        [
          "tr",
          {},
          [
            "th",
            {},
            "Formatting"
          ],
          [
            "th",
            {},
            "Example"
          ]
        ]
      ],
      [
        "tbody",
        {},
        [
          "tr",
          {},
          [
            "td",
            {},
            [
              "strong",
              {},
              "Bold"
            ]
          ],
          [
            "td",
            {},
            [
              "code",
              {},
              "code"
            ]
          ]
        ],
        [
          "tr",
          {},
          [
            "td",
            {},
            [
              "em",
              {},
              "Italic"
            ]
          ],
          [
            "td",
            {},
            [
              "a",
              {
                "href": "url"
              },
              "link"
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
<table>
  <thead>
    <tr>
      <th>Formatting</th>
      <th>Example</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Bold</strong></td>
      <td><code>code</code></td>
    </tr>
    <tr>
      <td><em>Italic</em></td>
      <td><a href="url">link</a></td>
    </tr>
  </tbody>
</table>
```

## Markdown

```md
| Formatting | Example     |
| ---------- | ----------- |
| **Bold**   | `code`      |
| *Italic*   | [link](url) |
```

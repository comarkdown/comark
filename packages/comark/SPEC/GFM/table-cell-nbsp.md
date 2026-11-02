## Input

```md
| Release | Initial release | End of life |
| --- | --- | --- |
| **5.x** (scheduled) | Q4 2026 | &nbsp; |
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
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
            "Release"
          ],
          [
            "th",
            {},
            "Initial release"
          ],
          [
            "th",
            {},
            "End of life"
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
              "5.x"
            ],
            " (scheduled)"
          ],
          [
            "td",
            {},
            "Q4 2026"
          ],
          [
            "td",
            {},
            " "
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
      <th>Release</th>
      <th>Initial release</th>
      <th>End of life</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>5.x</strong> (scheduled)</td>
      <td>Q4 2026</td>
      <td> </td>
    </tr>
  </tbody>
</table>
```

## Markdown

```md
| Release             | Initial release | End of life |
| ------------------- | --------------- | ----------- |
| **5.x** (scheduled) | Q4 2026         | &nbsp;      |
```

## Input

```md
::table{attr="value"}
|col1|col2|
|------|------|
|cell1|cell2|
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "table",
      {
        "attr": "value"
      },
      [
        "thead",
        {},
        [
          "tr",
          {},
          [
            "th",
            {},
            "col1"
          ],
          [
            "th",
            {},
            "col2"
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
            "cell1"
          ],
          [
            "td",
            {},
            "cell2"
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<table attr="value">
  <thead>
    <tr>
      <th>col1</th>
      <th>col2</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>cell1</td>
      <td>cell2</td>
    </tr>
  </tbody>
</table>
```

## Markdown

```md
::table{attr="value"}
| col1  | col2  |
| ----- | ----- |
| cell1 | cell2 |
::
```

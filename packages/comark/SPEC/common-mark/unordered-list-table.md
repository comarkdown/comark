## Input

```md
- Item with table:

  | Name  | Value |
  |-------|-------|
  | foo   | bar   |
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
        [
          "p",
          {},
          "Item with table:"
        ],
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
                "Name"
              ],
              [
                "th",
                {},
                "Value"
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
                "foo"
              ],
              [
                "td",
                {},
                "bar"
              ]
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
    <p>Item with table:</p>
    <table>
      <thead>
        <tr>
          <th>Name</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>foo</td>
          <td>bar</td>
        </tr>
      </tbody>
    </table>
  </li>
</ul>
```

## Markdown

```md
- Item with table:
  | Name | Value |
  | ---- | ----- |
  | foo  | bar   |
```

---
options:
  plugins:
    - binding
---

## Input

```md
| Name | Score |
| --- | --- |
| {{ a.name }} | {{ a.score }} |
| {{ b.name }} | {{ b.score }} |
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
            "Name"
          ],
          [
            "th",
            {},
            "Score"
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
              "binding",
              {
                ":value": "a.name"
              }
            ]
          ],
          [
            "td",
            {},
            [
              "binding",
              {
                ":value": "a.score"
              }
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
              "binding",
              {
                ":value": "b.name"
              }
            ]
          ],
          [
            "td",
            {},
            [
              "binding",
              {
                ":value": "b.score"
              }
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
      <th>Name</th>
      <th>Score</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <binding value="a.name"></binding>
      </td>
      <td>
        <binding value="a.score"></binding>
      </td>
    </tr>
    <tr>
      <td>
        <binding value="b.name"></binding>
      </td>
      <td>
        <binding value="b.score"></binding>
      </td>
    </tr>
  </tbody>
</table>
```

## Markdown

```md
| Name                            | Score                            |
| ------------------------------- | -------------------------------- |
| ::binding{:value="a.name"}   :: | ::binding{:value="a.score"}   :: |
| ::binding{:value="b.name"}   :: | ::binding{:value="b.score"}   :: |
```

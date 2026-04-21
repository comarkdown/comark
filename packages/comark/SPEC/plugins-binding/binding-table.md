---
options:
  plugins:
    - binding
---

## Input

```md
---
a:
  name: Alice
  score: 90
b:
  name: Bob
  score: 85
---

| Name | Score |
| --- | --- |
| {{ frontmatter.a.name }} | {{ frontmatter.a.score }} |
| {{ frontmatter.b.name }} | {{ frontmatter.b.score }} |
```

## AST

```json
{
  "frontmatter": {
    "a": {
      "name": "Alice",
      "score": 90
    },
    "b": {
      "name": "Bob",
      "score": 85
    }
  },
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
                ":value": "frontmatter.a.name"
              }
            ]
          ],
          [
            "td",
            {},
            [
              "binding",
              {
                ":value": "frontmatter.a.score"
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
                ":value": "frontmatter.b.name"
              }
            ]
          ],
          [
            "td",
            {},
            [
              "binding",
              {
                ":value": "frontmatter.b.score"
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
        Alice
      </td>
      <td>
        90
      </td>
    </tr>
    <tr>
      <td>
        Bob
      </td>
      <td>
        85
      </td>
    </tr>
  </tbody>
</table>
```

## Markdown

```md
---
a:
  name: Alice
  score: 90
b:
  name: Bob
  score: 85
---

| Name                     | Score                     |
| ------------------------ | ------------------------- |
| {{ frontmatter.a.name }} | {{ frontmatter.a.score }} |
| {{ frontmatter.b.name }} | {{ frontmatter.b.score }} |
```

## Input

```md
**Note**:badge[beta] [a]{.x}[b]{.y}

| *Status*:badge[ok] |
| --- |
| x |
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      {},
      [
        "strong",
        {},
        "Note"
      ],
      [
        "badge",
        {},
        "beta"
      ],
      " ",
      [
        "span",
        {
          "class": "x"
        },
        "a"
      ],
      [
        "span",
        {
          "class": "y"
        },
        "b"
      ]
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
            [
              "em",
              {},
              "Status"
            ],
            [
              "badge",
              {},
              "ok"
            ]
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
            "x"
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<p>
  <strong>Note</strong><badge>beta</badge> <span class="x">a</span><span class="y">b</span>
</p>
<table>
  <thead>
    <tr>
      <th>
        <em>Status</em>
        <badge>ok</badge>
      </th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>x</td>
    </tr>
  </tbody>
</table>
```

## Markdown

```md
**Note**:badge[beta] [a]{.x}[b]{.y}

| *Status*:badge[ok] |
| ------------------ |
| x                  |
```

## Markdown HTML

```md
**Note**<badge>beta</badge> <span class="x">a</span><span class="y">b</span>

| *Status*<badge>ok</badge> |
| ------------------------- |
| x                         |
```

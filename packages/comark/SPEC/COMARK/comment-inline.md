## Input

```md
Hello <!-- note --> world

**bold <!-- hidden --> text**
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
      "Hello ",
      [
        null,
        {},
        " note "
      ],
      " world"
    ],
    [
      "p",
      {},
      [
        "strong",
        {},
        "bold ",
        [
          null,
          {},
          " hidden "
        ],
        " text"
      ]
    ]
  ]
}
```

## HTML

```html
<p>
  Hello <!-- note --> world
</p>
<p><strong>bold <!-- hidden --> text</strong></p>
```

## Markdown

```md
Hello <!-- note --> world

**bold <!-- hidden --> text**
```

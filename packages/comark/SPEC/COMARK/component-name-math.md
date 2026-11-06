## Input

```md
Some :math[x] text.

::math{k="v"}
body
::
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
      "Some ",
      [
        "math",
        {},
        "x"
      ],
      " text."
    ],
    [
      "math",
      {
        "k": "v"
      },
      "body"
    ]
  ]
}
```

## HTML

```html
<p>
  Some <math>x</math> text.
</p>
<math k="v">
  body
</math>
```

## Markdown

```md
Some :math[x] text.

::math{k="v"}
body
::
```

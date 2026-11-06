## Input

```md
Some :mermaid[x] text.

::mermaid
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
        "mermaid",
        {},
        "x"
      ],
      " text."
    ],
    [
      "mermaid",
      {},
      "body"
    ]
  ]
}
```

## HTML

```html
<p>
  Some <mermaid>x</mermaid> text.
</p>
<mermaid>
  body
</mermaid>
```

## Markdown

```md
Some :mermaid[x] text.

::mermaid
body
::
```

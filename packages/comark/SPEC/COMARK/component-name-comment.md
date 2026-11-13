## Input

```md
Some :comment[a note]{author="maxi"} text.

::comment
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
        "comment",
        {
          "author": "maxi"
        },
        "a note"
      ],
      " text."
    ],
    [
      "comment",
      {},
      "body"
    ]
  ]
}
```

## HTML

```html
<p>
  Some <comment author="maxi">a note</comment> text.
</p>
<comment>
  body
</comment>
```

## Markdown

```md
Some :comment[a note]{author="maxi"} text.

::comment
body
::
```

## Input

```md
Some :template[x] text.

::template{k="v"}
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
        "template",
        {},
        "x"
      ],
      " text."
    ],
    [
      "template",
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
  Some <template>x</template> text.
</p>
<template k="v">
  body
</template>
```

## Markdown

```md
Some :template[x] text.

::template{k="v"}
body
::
```

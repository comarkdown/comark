## Input

```md
:::: spoiler
This is a spoiler.

::: warning
Nested warning inside spoiler.
:::

More spoiler content.
::::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "spoiler",
      {},
      [
        "p",
        {},
        "This is a spoiler."
      ],
      [
        "warning",
        {},
        "Nested warning inside spoiler."
      ],
      [
        "p",
        {},
        "More spoiler content."
      ]
    ]
  ]
}
```

## HTML

```html
<spoiler>
  <p>This is a spoiler.</p>
  <warning>
    Nested warning inside spoiler.
  </warning>
  <p>More spoiler content.</p>
</spoiler>
```

## Markdown

```md
::spoiler
This is a spoiler.

  :::warning
  Nested warning inside spoiler.
  :::

More spoiler content.
::
```

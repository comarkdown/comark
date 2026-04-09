## Input

```md
::::: spoiler
Outer content.

:::: warning
Inner content.

::: note
Deeply nested.
:::

::::

:::::
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
        "Outer content."
      ],
      [
        "warning",
        {},
        [
          "p",
          {},
          "Inner content."
        ],
        [
          "note",
          {},
          "Deeply nested."
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<spoiler>
  <p>Outer content.</p>
  <warning>
    <p>Inner content.</p>
    <note>
      Deeply nested.
    </note>
  </warning>
</spoiler>
```

## Markdown

```md
::spoiler
Outer content.

  :::warning
  Inner content.

    ::::note
    Deeply nested.
    ::::
  :::
::
```

## Input

```md
::: warning
This is a **warning** message.

Do not ignore it.
:::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "warning",
      {},
      [
        "p",
        {},
        "This is a ",
        [
          "strong",
          {},
          "warning"
        ],
        " message."
      ],
      [
        "p",
        {},
        "Do not ignore it."
      ]
    ]
  ]
}
```

## HTML

```html
<warning>
  <p>This is a <strong>warning</strong> message.</p>
  <p>Do not ignore it.</p>
</warning>
```

## Markdown

```md
::warning
This is a **warning** message.

Do not ignore it.
::
```

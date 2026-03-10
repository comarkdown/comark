---
timeout:
  parse: 15ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.
>
> Stay sheltered. Don’t leave your home. It’s very dangerous outside. Bombs will be dropping everywhere.
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "blockquote",
      {
        "as": "caution"
      },
      "Advises about risks or negative outcomes of certain actions."
    ],
    [
      "blockquote",
      {
        "as": "important"
      },
      "Key information users need to know to achieve their goal."
    ],
    [
      "blockquote",
      {
        "as": "note"
      },
      "Useful information that users should know, even when skimming content."
    ],
    [
      "blockquote",
      {
        "as": "tip"
      },
      "Helpful advice for doing things better or more easily."
    ],
    [
      "blockquote",
      {
        "as": "warning"
      },
      [
        "p",
        {},
        "Urgent info that needs immediate user attention to avoid problems."
      ],
      [
        "p",
        {},
        "Stay sheltered. Don’t leave your home. It’s very dangerous outside. Bombs will be dropping everywhere."
      ]
    ]
  ]
}
```

## HTML

```html
<blockquote as="caution">
  Advises about risks or negative outcomes of certain actions.
</blockquote>
<blockquote as="important">
  Key information users need to know to achieve their goal.
</blockquote>
<blockquote as="note">
  Useful information that users should know, even when skimming content.
</blockquote>
<blockquote as="tip">
  Helpful advice for doing things better or more easily.
</blockquote>
<blockquote as="warning">
  <p>Urgent info that needs immediate user attention to avoid problems.</p>
  <p>Stay sheltered. Don’t leave your home. It’s very dangerous outside. Bombs will be dropping everywhere.</p>
</blockquote>
```

## Markdown

```md
> [!CAUTION]
> Advises about risks or negative outcomes of certain actions.

> [!IMPORTANT]
> Key information users need to know to achieve their goal.

> [!NOTE]
> Useful information that users should know, even when skimming content.

> [!TIP]
> Helpful advice for doing things better or more easily.

> [!WARNING]
> Urgent info that needs immediate user attention to avoid problems.
>
> Stay sheltered. Don’t leave your home. It’s very dangerous outside. Bombs will be dropping everywhere.
```

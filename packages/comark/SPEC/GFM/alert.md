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
      [
        "p",
        {},
        "Advises about risks or negative outcomes of certain actions."
      ]
    ],
    [
      "blockquote",
      {
        "as": "important"
      },
      [
        "p",
        {},
        "Key information users need to know to achieve their goal."
      ]
    ],
    [
      "blockquote",
      {
        "as": "note"
      },
      [
        "p",
        {},
        "Useful information that users should know, even when skimming content."
      ]
    ],
    [
      "blockquote",
      {
        "as": "tip"
      },
      [
        "p",
        {},
        "Helpful advice for doing things better or more easily."
      ]
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
  <p>Advises about risks or negative outcomes of certain actions.</p>
</blockquote>
<blockquote as="important">
  <p>Key information users need to know to achieve their goal.</p>
</blockquote>
<blockquote as="note">
  <p>Useful information that users should know, even when skimming content.</p>
</blockquote>
<blockquote as="tip">
  <p>Helpful advice for doing things better or more easily.</p>
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

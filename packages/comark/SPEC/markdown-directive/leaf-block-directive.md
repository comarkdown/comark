---
skip: true
comment: // TODO lets see how Comark can support this syntax wihtout breaking current behavior
---

## Input

```md
:: youtube[Keyboard Cat]{vid=09jf3ow9jfw}

:: include{file=other-file.md}

:: toc[Table of Contents]
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "youtube",
      {
        "vid": "09jf3ow9jfw"
      },
      "Keyboard Cat"
    ],
    [
      "include",
      {
        "file": "other-file.md"
      }
    ],
    [
      "toc",
      {},
      "Table of Contents"
    ]
  ]
}
```

## HTML

```html
<youtube vid="09jf3ow9jfw">Keyboard Cat</youtube>
<include file="other-file.md"></include>
<toc>Table of Contents</toc>
```

## Markdown

```md
:: youtube[Keyboard Cat]{vid=09jf3ow9jfw}

:: include{file=other-file.md}

:: toc[Table of Contents]
```

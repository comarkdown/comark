---
skip: true
comment: // BUG repro — `:8100` is parsed as an inline component named `8100`, producing createElement('8100') and crashing renderers. A purely numeric name should stay plain text. Unskip once the inline-component parser rejects names that don't start with a letter.
---

## Input

```md
The server is running on :8100
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
      "The server is running on :8100"
    ]
  ]
}
```

## HTML

```html
<p>The server is running on :8100</p>
```

## Markdown

```md
The server is running on :8100
```

---
timeout:
  parse: 500ms
  html: 5ms
  markdown: 5ms
options:
  highlight:
    themes:
      light: 'github-dark'
    preStyles: true
---

## Input

```md
[**Bold** and *italic* text]{.highlight}
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
      [
        "span",
        {
          "class": "highlight"
        },
        [
          "strong",
          {},
          "Bold"
        ],
        " and ",
        [
          "em",
          {},
          "italic"
        ],
        " text"
      ]
    ]
  ]
}
```

## HTML

```html
<p><span class="highlight"><strong>Bold</strong> and <em>italic</em> text</span></p>
```

## Markdown

```md
[**Bold** and *italic* text]{.highlight}
```

---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
<Hello>
Hello **World**
</Hello>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "hello",
      {
        "$": { "html": 1, "block": 1 }
      },
      "Hello ",
      [
        "strong",
        {},
        "World"
      ]
    ]
  ]
}
```

## HTML

```html
<hello>
  Hello <strong>World</strong>
</hello>
```

## Markdown

```md
<hello>
Hello **World**
</hello>
```

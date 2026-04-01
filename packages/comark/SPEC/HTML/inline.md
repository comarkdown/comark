## Input

```md
<Hello>Hello **World**</Hello>
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
        "hello",
        {
          "$": { "html": 1, "block": 0 }
        },
        "Hello ",
        [
          "strong",
          {},
          "World"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<p>
  <hello>Hello <strong>World</strong></hello>
</p>
```

## Markdown

```md
<hello>Hello **World**</hello>
```

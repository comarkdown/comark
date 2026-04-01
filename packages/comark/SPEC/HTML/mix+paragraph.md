## Input

```md
<Hello>
Hello **World**
</Hello>
Another Pragraph
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
    ],
    [
      "p",
      {},
      "Another Pragraph"
    ]
  ]
}
```

## HTML

```html
<hello>
  Hello <strong>World</strong>
</hello>
<p>Another Pragraph</p>
```

## Markdown

```md
<hello>
Hello **World**
</hello>

Another Pragraph
```

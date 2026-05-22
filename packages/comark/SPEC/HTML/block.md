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
      "Hello **World**"
    ]
  ]
}
```

## HTML

```html
<hello>
  Hello **World**
</hello>
```

## Markdown

```md
<hello>
Hello **World**
</hello>
```

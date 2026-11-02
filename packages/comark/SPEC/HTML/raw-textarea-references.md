## Input

```md
<textarea>a &amp; b</textarea>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "textarea",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      },
      "a & b"
    ]
  ]
}
```

## HTML

```html
<textarea>a & b</textarea>
```

## Markdown

```md
<textarea>a &amp; b</textarea>
```

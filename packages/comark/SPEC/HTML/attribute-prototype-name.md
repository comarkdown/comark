## Input

```md
<div constructor="a" constructor="b">x</div>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "div",
      {
        "$": {
          "html": 1,
          "block": 1
        },
        "constructor": "a"
      },
      "x"
    ]
  ]
}
```

## HTML

```html
<div constructor="a">
  x
</div>
```

## Markdown

```md
<div constructor="a">
x
</div>
```

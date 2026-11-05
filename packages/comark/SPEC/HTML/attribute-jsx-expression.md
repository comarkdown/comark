## Input

```md
<div style={{a: 1}}>

x
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
        "style": "{{a: 1}}"
      },
      "x"
    ]
  ]
}
```

## HTML

```html
<div style="{{a: 1}}">
  x
</div>
```

## Markdown

```md
<div style="{{a: 1}}">
x
</div>
```

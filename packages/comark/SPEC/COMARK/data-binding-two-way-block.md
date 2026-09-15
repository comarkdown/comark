## Input

```md
::card{::title="data.heading"}
content
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "card",
      {
        "::title": "data.heading"
      },
      "content"
    ]
  ]
}
```

## HTML

```html
<card data-comark-model-title="data.heading">
  content
</card>
```

## Markdown

```md
::card{::title="data.heading"}
content
::
```

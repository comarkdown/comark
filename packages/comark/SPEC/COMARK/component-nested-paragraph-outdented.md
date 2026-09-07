## Input

```md
::tabs
  :::tabs-item{label="Code"}
hello world
  :::
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "tabs",
      {},
      [
        "tabs-item",
        {
          "label": "Code"
        },
        "hello world"
      ]
    ]
  ]
}
```

## HTML

```html
<tabs>
  <tabs-item label="Code">
    hello world
  </tabs-item>
</tabs>
```

## Markdown

```md
::tabs
  :::tabs-item{label="Code"}
  hello world
  :::
::
```

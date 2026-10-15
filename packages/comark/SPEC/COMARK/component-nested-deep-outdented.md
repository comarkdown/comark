## Input

```md
::a-tabs
  :::a-item
    ::::a-inner
text
    ::::
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
      "a-tabs",
      {},
      [
        "a-item",
        {},
        [
          "a-inner",
          {},
          "text"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<a-tabs>
  <a-item>
    <a-inner>
      text
    </a-inner>
  </a-item>
</a-tabs>
```

## Markdown

```md
::a-tabs
  :::a-item
    ::::a-inner
    text
    ::::
  :::
::
```

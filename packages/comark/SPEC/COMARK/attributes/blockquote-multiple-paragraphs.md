## Input

```md
> Blockquote paragraph 1 {attr="value"}
>
> Blockquote paragraph 2 {attr2="value2"}
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "blockquote",
      {},
      [
        "p",
        {
          "attr": "value"
        },
        "Blockquote paragraph 1"
      ],
      [
        "p",
        {
          "attr2": "value2"
        },
        "Blockquote paragraph 2"
      ]
    ]
  ]
}
```

## HTML

```html
<blockquote>
  <p attr="value">Blockquote paragraph 1</p>
  <p attr2="value2">Blockquote paragraph 2</p>
</blockquote>
```

## Markdown

```md
> Blockquote paragraph 1 {attr="value"}
>
> Blockquote paragraph 2 {attr2="value2"}
```

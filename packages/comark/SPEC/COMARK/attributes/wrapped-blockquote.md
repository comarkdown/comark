## Input

```md
::blockquote{attr="value"}
> Blockquote paragraph 1 {attr="value"}
>
> Blockquote paragraph 2 {attr2="value2"}
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "blockquote",
      {
        "attr": "value"
      },
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
<blockquote attr="value">
  <p attr="value">Blockquote paragraph 1</p>
  <p attr2="value2">Blockquote paragraph 2</p>
</blockquote>
```

## Markdown

```md
::blockquote{attr="value"}
> Blockquote paragraph 1 {attr="value"}
>
> Blockquote paragraph 2 {attr2="value2"}
::
```

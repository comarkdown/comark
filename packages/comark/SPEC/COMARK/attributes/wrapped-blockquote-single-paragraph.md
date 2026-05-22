## Input

```md
::blockquote{attr="value"}
> Blockquote paragraph 1
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
      "Blockquote paragraph 1"
    ]
  ]
}
```

## HTML

```html
<blockquote attr="value">
  Blockquote paragraph 1
</blockquote>
```

## Markdown

```md
> Blockquote paragraph 1 {attr="value"}
```

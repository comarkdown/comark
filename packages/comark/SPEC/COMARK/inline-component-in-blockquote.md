## Input

```md
> Quote :badge[x] end
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
      "Quote ",
      [
        "badge",
        {},
        "x"
      ],
      " end"
    ]
  ]
}
```

## HTML

```html
<blockquote>
  Quote <badge>
    x
  </badge> end
</blockquote>
```

## Markdown

```md
> Quote :badge[x] end
```

## Markdown HTML

```md
> Quote <badge>x</badge> end
```

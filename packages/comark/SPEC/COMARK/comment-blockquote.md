## Input

```md
> <!-- note -->
>
> foo
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
        null,
        {},
        " note "
      ],
      [
        "p",
        {},
        "foo"
      ]
    ]
  ]
}
```

## HTML

```html
<blockquote>
  <!-- note -->

  <p>foo</p>
</blockquote>
```

## Markdown

```md
> <!-- note -->
>
> foo
```

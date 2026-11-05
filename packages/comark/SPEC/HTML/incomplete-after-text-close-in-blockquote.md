## Input

```md
a <b>one

> </b>

last
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      {},
      "a ",
      [
        "b",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        "one"
      ]
    ],
    [
      "blockquote",
      {}
    ],
    [
      "p",
      {},
      "last"
    ]
  ]
}
```

## HTML

```html
<p>
  a <b>one</b>
</p>
<blockquote></blockquote>
<p>last</p>
```

## Markdown

```md
a <b>one</b>

>

last
```

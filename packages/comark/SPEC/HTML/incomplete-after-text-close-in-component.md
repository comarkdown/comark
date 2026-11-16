## Input

```md
a <b>one

::card
</b>
::

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
      "card",
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
<card></card>
<p>last</p>
```

## Markdown

```md
a <b>one</b>

::card
::

last
```

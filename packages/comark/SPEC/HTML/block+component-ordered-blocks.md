## Input

```md
::foo
<div>

para

# Title

more

</div>
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "foo",
      {},
      [
        "div",
        {
          "$": {
            "html": 1,
            "block": 1
          }
        },
        [
          "p",
          {},
          "para"
        ],
        [
          "h1",
          {
            "id": "title"
          },
          "Title"
        ],
        [
          "p",
          {},
          "more"
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<foo>
  <div>
    <p>para</p>
    <h1 id="title">Title</h1>
    <p>more</p>
  </div>
</foo>
```

## Markdown

```md
::foo
<div>
para


# Title


more
</div>
::
```

## Input

```md
# Title <code>x</code> end
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "h1",
      {
        "id": "title-x-end"
      },
      "Title ",
      [
        "code",
        {
          "$": {
            "html": 1,
            "block": 0
          }
        },
        "x"
      ],
      " end"
    ]
  ]
}
```

## HTML

```html
<h1 id="title-x-end">Title <code>x</code> end</h1>
```

## Markdown

```md
# Title <code>x</code> end
```

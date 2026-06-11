## Input

```md
**that contain it **[here](/url)**.**
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
      [
        "strong",
        {},
        "that contain it ",
        [
          "strong",
          {},
          [
            "a",
            {
              "href": "/url"
            },
            "here"
          ]
        ],
        "."
      ]
    ]
  ]
}
```

## HTML

```html
<p><strong>that contain it <strong><a href="/url">here</a></strong>.</strong></p>
```

## Markdown

```md
**that contain it **[here](/url)**.**
```

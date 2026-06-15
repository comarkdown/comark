## Input

```md
[foo\] bar](/url)
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
        "a",
        {
          "href": "/url"
        },
        "foo] bar"
      ]
    ]
  ]
}
```

## HTML

```html
<p><a href="/url">foo] bar</a></p>
```

## Markdown

```md
[foo\] bar](/url)
```

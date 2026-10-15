## Input

```md
[[1]{} Document](#)

[[link-name]{.cls} more](https://example.com)
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
          "href": "#"
        },
        [
          "span",
          {},
          "1"
        ],
        " Document"
      ]
    ],
    [
      "p",
      {},
      [
        "a",
        {
          "href": "https://example.com"
        },
        [
          "span",
          {
            "class": "cls"
          },
          "link-name"
        ],
        " more"
      ]
    ]
  ]
}
```

## HTML

```html
<p><a href="#"><span>1</span> Document</a></p>
<p><a href="https://example.com"><span class="cls">link-name</span> more</a></p>
```

## Markdown

```md
[[1]{} Document](#)

[[link-name]{.cls} more](https://example.com)
```

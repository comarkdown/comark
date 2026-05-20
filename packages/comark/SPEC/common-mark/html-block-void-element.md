## Input

```md
<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# comark

A high-performance markdown parser and renderer.
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "img",
      {
        "$": {
          "html": 1,
          "block": 1
        },
        "src": "https://github.com/comarkdown/comark/blob/main/assets/banner.jpg",
        "width": "100%",
        "alt": "Comark banner"
      }
    ],
    [
      "h1",
      {
        "id": "comark"
      },
      "comark"
    ],
    [
      "p",
      {},
      "A high-performance markdown parser and renderer."
    ]
  ]
}
```

## HTML

```html
<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />
<h1 id="comark">comark</h1>
<p>A high-performance markdown parser and renderer.</p>
```

## Markdown

```md
<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# comark

A high-performance markdown parser and renderer.
```

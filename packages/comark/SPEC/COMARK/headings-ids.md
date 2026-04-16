## Input

```md
# H1

## H2

### H3

#### H4

### Another H3

## Another H2

#### H4
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
        "id": "h1"
      },
      "H1"
    ],
    [
      "h2",
      {
        "id": "h2"
      },
      "H2"
    ],
    [
      "h3",
      {
        "id": "h2-h3"
      },
      "H3"
    ],
    [
      "h4",
      {
        "id": "h2-h3-h4"
      },
      "H4"
    ],
    [
      "h3",
      {
        "id": "h2-another-h3"
      },
      "Another H3"
    ],
    [
      "h2",
      {
        "id": "another-h2"
      },
      "Another H2"
    ],
    [
      "h4",
      {
        "id": "another-h2-h4"
      },
      "H4"
    ]
  ]
}
```

## HTML

```html
<h1 id="h1">H1</h1>
<h2 id="h2">H2</h2>
<h3 id="h2-h3">H3</h3>
<h4 id="h2-h3-h4">H4</h4>
<h3 id="h2-another-h3">Another H3</h3>
<h2 id="another-h2">Another H2</h2>
<h4 id="another-h2-h4">H4</h4>
```

## Markdown

```md
# H1

## H2

### H3

#### H4

### Another H3

## Another H2

#### H4
```

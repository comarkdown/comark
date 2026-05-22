## Input

```md
# h1 {attr="value"}

## h2 {attr="value"}

### h3 {attr="value"}

#### h4 {attr="value"}

##### h5 {attr="value"}

###### h6 {attr="value"}
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
        "id": "h1",
        "attr": "value"
      },
      "h1"
    ],
    [
      "h2",
      {
        "id": "h2",
        "attr": "value"
      },
      "h2"
    ],
    [
      "h3",
      {
        "id": "h2-h3",
        "attr": "value"
      },
      "h3"
    ],
    [
      "h4",
      {
        "id": "h2-h3-h4",
        "attr": "value"
      },
      "h4"
    ],
    [
      "h5",
      {
        "id": "h2-h3-h4-h5",
        "attr": "value"
      },
      "h5"
    ],
    [
      "h6",
      {
        "id": "h2-h3-h4-h5-h6",
        "attr": "value"
      },
      "h6"
    ]
  ]
}
```

## HTML

```html
<h1 id="h1" attr="value">h1</h1>
<h2 id="h2" attr="value">h2</h2>
<h3 id="h2-h3" attr="value">h3</h3>
<h4 id="h2-h3-h4" attr="value">h4</h4>
<h5 id="h2-h3-h4-h5" attr="value">h5</h5>
<h6 id="h2-h3-h4-h5-h6" attr="value">h6</h6>
```

## Markdown

```md
# h1 {attr="value"}

## h2 {attr="value"}

### h3 {attr="value"}

#### h4 {attr="value"}

##### h5 {attr="value"}

###### h6 {attr="value"}
```

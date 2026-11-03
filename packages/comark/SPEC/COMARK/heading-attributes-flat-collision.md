---
options:
  headingIds: flat
---

## Input

```md
## Foo

### Foo

### Foo-1

## Bar-1

## Bar

## Bar
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "h2",
      {
        "id": "foo"
      },
      "Foo"
    ],
    [
      "h3",
      {
        "id": "foo-1"
      },
      "Foo"
    ],
    [
      "h3",
      {
        "id": "foo-1-1"
      },
      "Foo-1"
    ],
    [
      "h2",
      {
        "id": "bar-1"
      },
      "Bar-1"
    ],
    [
      "h2",
      {
        "id": "bar"
      },
      "Bar"
    ],
    [
      "h2",
      {
        "id": "bar-2"
      },
      "Bar"
    ]
  ]
}
```

## HTML

```html
<h2 id="foo">Foo</h2>
<h3 id="foo-1">Foo</h3>
<h3 id="foo-1-1">Foo-1</h3>
<h2 id="bar-1">Bar-1</h2>
<h2 id="bar">Bar</h2>
<h2 id="bar-2">Bar</h2>
```

## Markdown

```md
## Foo

### Foo

### Foo-1

## Bar-1

## Bar

## Bar
```

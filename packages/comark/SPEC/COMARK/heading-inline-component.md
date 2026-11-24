## Input

```md
## [Unreleased]

# :badge[New]
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
        "id": "unreleased"
      },
      [
        "span",
        {},
        "Unreleased"
      ]
    ],
    [
      "h1",
      {
        "id": "new"
      },
      [
        "badge",
        {},
        "New"
      ]
    ]
  ]
}
```

## HTML

```html
<h2 id="unreleased"><span>Unreleased</span></h2>
<h1 id="new">
  <badge>New</badge>
</h1>
```

## Markdown

```md
## [Unreleased]

# :badge[New]
```

## Markdown HTML

```md
## <span>Unreleased</span>

# <badge>New</badge>
```

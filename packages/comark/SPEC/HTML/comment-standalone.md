## Input

```md
<!-- a -->

   <!--- b --->
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      null,
      {},
      " a "
    ],
    [
      null,
      {},
      "- b -"
    ]
  ]
}
```

## HTML

```html
<!-- a -->
<!--- b --->
```

## Markdown

```md
<!-- a -->

<!--- b --->
```

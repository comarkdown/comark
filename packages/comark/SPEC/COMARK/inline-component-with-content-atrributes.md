## Input

```md
:inline[Syntax]{with=prop}
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "inline",
      {
        "with": "prop"
      },
      "Syntax"
    ]
  ]
}
```

## HTML

```html
<inline with="prop">
  Syntax
</inline>
```

## Markdown

```md
::inline{with="prop"}
Syntax
::
```

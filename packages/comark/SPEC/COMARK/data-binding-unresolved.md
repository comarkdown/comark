## Input

```md
::card{:to="$doc.snippet.link"}
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "card",
      {
        ":to": "$doc.snippet.link"
      }
    ]
  ]
}
```

## HTML

```html
<card to="$doc.snippet.link"></card>
```

## Markdown

```md
::card{:to="$doc.snippet.link"}
::
```

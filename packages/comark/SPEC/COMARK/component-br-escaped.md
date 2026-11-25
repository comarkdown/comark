## Input

```md
::tip
before  
\# literal
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "tip",
      {},
      "before",
      [
        "br",
        {}
      ],
      "# literal"
    ]
  ]
}
```

## HTML

```html
<tip>
  before<br># literal
</tip>
```

## Markdown

```md
::tip
before  
\# literal
::
```

## Markdown HTML

```md
<tip>

before  
\# literal

</tip>
```

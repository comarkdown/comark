## Input

```md
<Hello>
::component
Default Slot
::
</Hello>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "hello",
      {
        "$": { "html": 1, "block": 1 }
      },
      "::component\nDefault Slot\n::"
    ]
  ]
}
```

## HTML

```html
<hello>
  ::component
  Default Slot
  ::
</hello>
```

## Markdown

```md
<hello>
::component
Default Slot
::
</hello>
```

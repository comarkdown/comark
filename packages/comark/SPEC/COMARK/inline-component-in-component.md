## Input

```md
::alert
Hello :badge[x] world
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "alert",
      {},
      "Hello ",
      [
        "badge",
        {},
        "x"
      ],
      " world"
    ]
  ]
}
```

## HTML

```html
<alert>
  Hello <badge>
    x
  </badge> world
</alert>
```

## Markdown

```md
::alert
Hello :badge[x] world
::
```

## Markdown HTML

```md
<alert>

Hello <badge>x</badge> world

</alert>
```

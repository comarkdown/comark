## Input

```md
::note
Hello
:: <!-- end of note -->

After
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "note",
      {},
      "Hello"
    ],
    [
      "p",
      {},
      "After"
    ]
  ]
}
```

## HTML

```html
<note>
  Hello
</note>
<p>After</p>
```

## Markdown

```md
::note
Hello
::

After
```

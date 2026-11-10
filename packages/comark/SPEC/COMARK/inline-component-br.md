## Input

```md
::warning
Beware that using only `$fetch` will not provide network calls de-duplication. :br
It is recommended to use `$fetch` for client-side interactions.
::

Published modules cannot leverage auto-imports.
:br :br
Auto-imports are not enabled for files within `node_modules`.
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "warning",
      {},
      "Beware that using only ",
      [
        "code",
        {},
        "$fetch"
      ],
      " will not provide network calls de-duplication. ",
      [
        "br",
        {}
      ],
      "\nIt is recommended to use ",
      [
        "code",
        {},
        "$fetch"
      ],
      " for client-side interactions."
    ],
    [
      "p",
      {},
      "Published modules cannot leverage auto-imports.\n",
      [
        "br",
        {}
      ],
      " ",
      [
        "br",
        {}
      ],
      "\nAuto-imports are not enabled for files within ",
      [
        "code",
        {},
        "node_modules"
      ],
      "."
    ]
  ]
}
```

## HTML

```html
<warning>
  Beware that using only <code>$fetch</code> will not provide network calls de-duplication. <br>
  It is recommended to use <code>$fetch</code> for client-side interactions.
</warning>
<p>Published modules cannot leverage auto-imports.
<br> <br>
Auto-imports are not enabled for files within <code>node_modules</code>.</p>
```

## Markdown

```md
::warning
Beware that using only `$fetch` will not provide network calls de-duplication. :br
It is recommended to use `$fetch` for client-side interactions.
::

Published modules cannot leverage auto-imports.
:br :br
Auto-imports are not enabled for files within `node_modules`.
```

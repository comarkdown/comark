## Input

```md
:hello[text]{key=val} world

:hello[text]{key1=val1 key2="value with spaces"}

:::note{type="tip" level=3}
Content here.
:::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      {},
      [
        "hello",
        {
          "key": "val"
        },
        "text"
      ],
      " world"
    ],
    [
      "hello",
      {
        "key1": "val1",
        "key2": "value with spaces"
      },
      "text"
    ],
    [
      "note",
      {
        "type": "tip",
        "level": "3"
      },
      "Content here."
    ]
  ]
}
```

## HTML

```html
<p>
  <hello key="val">text</hello> world
</p>
<hello key1="val1" key2="value with spaces">
  text
</hello>
<note type="tip" level="3">
  Content here.
</note>
```

## Markdown

```md
:hello[text]{key="val"} world

::hello{key1="val1" key2="value with spaces"}
text
::

::note{type="tip" level="3"}
Content here.
::
```

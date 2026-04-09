## Input

```md
:spoiler[it's a _happy_ ending]

:ref[see **figure 1**]{target=myFigure}

::: note[Important Notice]{type="info"}
The label contains inline content but the body has block content.
:::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "spoiler",
      {},
      "it's a ",
      [
        "em",
        {},
        "happy"
      ],
      " ending"
    ],
    [
      "ref",
      {
        "target": "myFigure"
      },
      "see ",
      [
        "strong",
        {},
        "figure 1"
      ]
    ],
    [
      "note",
      {
        "type": "info"
      },
      [
        "p",
        {},
        "Important Notice"
      ],
      [
        "p",
        {},
        "The label contains inline content but the body has block content."
      ]
    ]
  ]
}
```

## HTML

```html
<spoiler>
  it's a <em>happy</em> ending
</spoiler>
<ref target="myFigure">
  see <strong>figure 1</strong>
</ref>
<note type="info">
  <p>Important Notice</p>
  <p>The label contains inline content but the body has block content.</p>
</note>
```

## Markdown

```md
::spoiler
it's a *happy* ending
::

::ref{target="myFigure"}
see **figure 1**
::

::note{type="info"}
Important Notice

The label contains inline content but the body has block content.
::
```

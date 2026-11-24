## Input

```md
<table><tr><td>

::alert
hi
::

</td></tr></table>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "table",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      },
      [
        "tr",
        {
          "$": {
            "html": 1,
            "block": 1
          }
        },
        [
          "td",
          {
            "$": {
              "html": 1,
              "block": 1
            }
          },
          [
            "alert",
            {},
            "hi"
          ]
        ]
      ]
    ]
  ]
}
```

## HTML

```html
<table>
  <tr>
    <td>
      <alert>
        hi
      </alert>
    </td>
  </tr>
</table>
```

## Markdown

```md
<table>
<tr>
<td>
  ::alert
  hi
  ::
</td>
</tr>
</table>
```

## Markdown HTML

```md
<table>
<tr>
<td>
<alert>

hi

</alert>
</td>
</tr>
</table>
```

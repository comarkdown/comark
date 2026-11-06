## Input

```md
::foo
<div>

default

#one
named
::
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "foo",
      {},
      [
        "div",
        {
          "$": {
            "html": 1,
            "block": 1
          }
        },
        "default"
      ],
      [
        "template",
        {
          "name": "one"
        },
        "named"
      ]
    ]
  ]
}
```

## HTML

```html
<foo>
  <div>
    default
  </div>
  <template name="one">
    named
  </template>
</foo>
```

## Markdown

```md
::foo
<div>
default
</div>

#one
named
::
```

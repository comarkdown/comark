## Input

```md
a :hr directive with no content

a :br with no content or attributes

:::video{file="movie.mp4"}
:::

:::separator
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
      "a ",
      [
        "hr",
        {}
      ],
      " directive with no content"
    ],
    [
      "p",
      {},
      "a ",
      [
        "br",
        {}
      ],
      " with no content or attributes"
    ],
    [
      "video",
      {
        "file": "movie.mp4"
      }
    ],
    [
      "separator",
      {}
    ]
  ]
}
```

## HTML

```html
<p>
  a 
  <hr />
   directive with no content
</p>
<p>a <br /> with no content or attributes</p>
<video file="movie.mp4"></video>
<separator></separator>
```

## Markdown

```md
a :hr directive with no content

a   
 with no content or attributes

::video{file="movie.mp4"}
::

::separator
::
```

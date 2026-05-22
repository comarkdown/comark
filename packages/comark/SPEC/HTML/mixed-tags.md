## Input

```md
a paragraph

<p><img src="/foo.png" alt="x"><strong>strong text</strong>

_ilo_
</p>

<p><img src="/foo.png" alt="x">
_ilo_
</p>

<p><img src="/bar.png" alt="x">_ilo_</p>

<p><code>**don't touch**</code></p>

<style>
::root {
  --var: #fff
}
</style>
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
      "a paragraph"
    ],
    [
      "p",
      { "$": { "html": 1, "block": 1 } },
      [
        "img",
        {
          "src": "/foo.png",
          "alt": "x",
          "$": { "html": 1, "block": 0 }
        }
      ],
      [
        "strong",
        { "$": { "html": 1, "block": 0 } },
        "strong text"
      ],
      [
        "em",
        {},
        "ilo"
      ]
    ],
    [
      "p",
      { "$": { "html": 1, "block": 1 } },
      [
        "img",
        {
          "src": "/foo.png",
          "alt": "x",
          "$": { "html": 1, "block": 0 }
        }
      ],
      [
        "em",
        {},
        "ilo"
      ]
    ],
    [
      "p",
      { "$": { "html": 1, "block": 1 } },
      [
        "img",
        {
          "src": "/bar.png",
          "alt": "x",
          "$": { "html": 1, "block": 0 }
        }
      ],
      [
        "em",
        {},
        "ilo"
      ]
    ],
    [
      "p",
      { "$": { "html": 1, "block": 1 } },
      [
        "code",
        { "$": { "html": 1, "block": 0 } },
        "**don't touch**"
      ]
    ],
    [
      "style",
      { "$": { "html": 1, "block": 1 } },
      "::root {\n  --var: #fff\n}"
    ]
  ]
}
```

## HTML

```html
<p>a paragraph</p>
<p><img src="/foo.png" alt="x" /><strong>strong text</strong><em>ilo</em></p>
<p><img src="/foo.png" alt="x" /><em>ilo</em></p>
<p><img src="/bar.png" alt="x" /><em>ilo</em></p>
<p><code>**don't touch**</code></p>
<style>
::root {
  --var: #fff
}
</style>
```

## Markdown

```md
a paragraph

<p><img src="/foo.png" alt="x" /><strong>strong text</strong>*ilo*</p>

<p><img src="/foo.png" alt="x" />*ilo*</p>

<p><img src="/bar.png" alt="x" />*ilo*</p>

<p><code>**don't touch**</code></p>

<style>
::root {
  --var: #fff
}
</style>
```

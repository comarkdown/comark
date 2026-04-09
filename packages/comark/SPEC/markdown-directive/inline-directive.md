## Input

```md
a :name[content] directive

a :cite[smith04] reference

paragraph with :abbr[HTML]{title="HyperText Markup Language"} inline
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
        "name",
        {},
        "content"
      ],
      " directive"
    ],
    [
      "p",
      {},
      "a ",
      [
        "cite",
        {},
        "smith04"
      ],
      " reference"
    ],
    [
      "p",
      {},
      "paragraph with ",
      [
        "abbr",
        {
          "title": "HyperText Markup Language"
        },
        "HTML"
      ],
      " inline"
    ]
  ]
}
```

## HTML

```html
<p>
  a <name>content</name> directive
</p>
<p>
  a <cite>smith04</cite> reference
</p>
<p>
  paragraph with <abbr title="HyperText Markup Language">HTML</abbr> inline
</p>
```

## Markdown

```md
a :name[content] directive

a :cite[smith04] reference

paragraph with :abbr[HTML]{title="HyperText Markup Language"} inline
```

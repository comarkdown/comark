## Input

```md
<pre>const a: Array<string> = []
</pre>

after
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "pre",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      },
      "const a: Array<string> = []\n"
    ],
    [
      "p",
      {},
      "after"
    ]
  ]
}
```

## HTML

```html
<pre>const a: Array&lt;string&gt; = []
</pre>
<p>after</p>
```

## Markdown

```md
<pre>const a: Array&lt;string> = []
</pre>

after
```

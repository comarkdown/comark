## Input

```md
<p><code>**don't parse**</code></p>

<pre>**literal**</pre>

<style>
.cls { _color_: red }
</style>

<script>
if (a && b) { x = 'no _em_ here' }
</script>

<style lang="scss">
.cls {
  &:hover { color: red }
}
</style>

<script name="app" type="module">
import { x } from './_y_'
</script>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "p",
      { "$": { "html": 1, "block": 1 } },
      [
        "code",
        { "$": { "html": 1, "block": 0 } },
        "**don't parse**"
      ]
    ],
    [
      "pre",
      { "$": { "html": 1, "block": 1 } },
      "**literal**"
    ],
    [
      "style",
      { "$": { "html": 1, "block": 1 } },
      ".cls { _color_: red }"
    ],
    [
      "script",
      { "$": { "html": 1, "block": 1 } },
      "if (a && b) { x = 'no _em_ here' }"
    ],
    [
      "style",
      { "$": { "html": 1, "block": 1 }, "lang": "scss" },
      ".cls {\n  &:hover { color: red }\n}"
    ],
    [
      "script",
      { "$": { "html": 1, "block": 1 }, "name": "app", "type": "module" },
      "import { x } from './_y_'"
    ]
  ]
}
```

## HTML

```html
<p><code>**don't parse**</code></p>
<pre>**literal**</pre>
<style>
.cls { _color_: red }
</style>
<script>
if (a && b) { x = 'no _em_ here' }
</script>
<style lang="scss">
.cls {
  &:hover { color: red }
}
</style>
<script name="app" type="module">
import { x } from './_y_'
</script>
```

## Markdown

```md
<p><code>**don't parse**</code></p>

<pre>**literal**</pre>

<style>
.cls { _color_: red }
</style>

<script>
if (a && b) { x = 'no _em_ here' }
</script>

<style lang="scss">
.cls {
  &:hover { color: red }
}
</style>

<script name="app" type="module">
import { x } from './_y_'
</script>
```

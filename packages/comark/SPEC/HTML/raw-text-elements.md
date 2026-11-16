## Input

```md
<textarea>a &lt; b</textarea>

<script>a &lt; b</script>

<style>a &lt; b</style>
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "textarea",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      },
      "a < b"
    ],
    [
      "script",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      },
      "a &lt; b"
    ],
    [
      "style",
      {
        "$": {
          "html": 1,
          "block": 1
        }
      },
      "a &lt; b"
    ]
  ]
}
```

## HTML

```html
<textarea>a &lt; b</textarea>
<script>a &lt; b</script>
<style>a &lt; b</style>
```

## Markdown

```md
<textarea>a &lt; b</textarea>

<script>a &lt; b</script>

<style>a &lt; b</style>
```

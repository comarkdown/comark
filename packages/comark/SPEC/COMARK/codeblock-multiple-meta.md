## Input

```md
```python showLineNumbers=true startLine=10 title="Example"
def greet(name):
    return f"Hello, {name}!"
```
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
        "language": "python",
        "meta": "showLineNumbers=true startLine=10 title=\"Example\""
      },
      [
        "code",
        {
          "class": "language-python"
        },
        "def greet(name):\n    return f\"Hello, {name}!\""
      ]
    ]
  ]
}
```

## HTML

```html
<pre language="python" meta="showLineNumbers=true startLine=10 title="Example""><code class="language-python">def greet(name):
    return f"Hello, {name}!"</code></pre>
```

## Markdown

```md
```python showLineNumbers=true startLine=10 title="Example"
def greet(name):
    return f"Hello, {name}!"
```
```

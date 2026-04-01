## Input

```md
# Hello

## Hello World

## Hello World
```

## AST

```json
{
  "frontmatter": {},
  "meta": {},
  "nodes": [
    [
      "h1",
      {
        "id": "hello"
      },
      "Hello"
    ],
    [
      "h2",
      {
        "id": "hello-world"
      },
      "Hello World"
    ],
    [
      "h2",
      {
        "id": "hello-world-1"
      },
      "Hello World"
    ]
  ]
}
```

## HTML

```html
<h1 id="hello">Hello</h1>
<h2 id="hello-world">Hello World</h2>
<h2 id="hello-world-1">Hello World</h2>
```

## Markdown

```md
# Hello

## Hello World

## Hello World
```

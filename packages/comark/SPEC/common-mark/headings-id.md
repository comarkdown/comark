---
timeout:
  parse: 5ms
  html: 5ms
  markdown: 5ms
---

## Input

```md
# Hello

# Hello World

## C. Great

## 1. Introduction

## ending space

### Slash - in - Title

### -Starting dash

### Ending dash-

### -Dash-
```

## AST

```json
{
  "type": "comark",
  "value": [
    [
      "h1",
      {
        "id": "hello"
      },
      "Hello"
    ],
    [
      "h1",
      {
        "id": "hello-world"
      },
      "Hello World"
    ],
    [
      "h2",
      {
        "id": "c-great"
      },
      "C. Great"
    ],
    [
      "h2",
      {
        "id": "_1-introduction"
      },
      "1. Introduction"
    ],
    [
      "h2",
      {
        "id": "ending-space"
      },
      "ending space"
    ],
    [
      "h3",
      {
        "id": "slash-in-title"
      },
      "Slash - in - Title"
    ],
    [
      "h3",
      {
        "id": "starting-dash"
      },
      "-Starting dash"
    ],
    [
      "h3",
      {
        "id": "ending-dash"
      },
      "Ending dash-"
    ],
    [
      "h3",
      {
        "id": "dash"
      },
      "-Dash-"
    ]
  ]
}
```

## HTML

```html
<h1 id="hello">Hello</h1>
<h1 id="hello-world">Hello World</h1>
<h2 id="c-great">C. Great</h2>
<h2 id="_1-introduction">1. Introduction</h2>
<h2 id="ending-space">ending space</h2>
<h3 id="slash-in-title">Slash - in - Title</h3>
<h3 id="starting-dash">-Starting dash</h3>
<h3 id="ending-dash">Ending dash-</h3>
<h3 id="dash">-Dash-</h3>
```

## Markdown

```md
# Hello

# Hello World

## C. Great

## 1. Introduction

## ending space

### Slash - in - Title

### -Starting dash

### Ending dash-

### -Dash-
```

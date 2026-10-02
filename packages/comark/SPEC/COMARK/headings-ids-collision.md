## Input

```md
# Bar

# Bar

# Bar-1

## Setup {#custom}

### Install

## Setup

### Install
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
        "id": "bar"
      },
      "Bar"
    ],
    [
      "h1",
      {
        "id": "bar-1"
      },
      "Bar"
    ],
    [
      "h1",
      {
        "id": "bar-1-1"
      },
      "Bar-1"
    ],
    [
      "h2",
      {
        "id": "custom"
      },
      "Setup"
    ],
    [
      "h3",
      {
        "id": "setup-install"
      },
      "Install"
    ],
    [
      "h2",
      {
        "id": "setup-1"
      },
      "Setup"
    ],
    [
      "h3",
      {
        "id": "setup-install-1"
      },
      "Install"
    ]
  ]
}
```

## HTML

```html
<h1 id="bar">Bar</h1>
<h1 id="bar-1">Bar</h1>
<h1 id="bar-1-1">Bar-1</h1>
<h2 id="custom">Setup</h2>
<h3 id="setup-install">Install</h3>
<h2 id="setup-1">Setup</h2>
<h3 id="setup-install-1">Install</h3>
```

## Markdown

```md
# Bar

# Bar

# Bar-1

## Setup {#custom}

### Install

## Setup

### Install
```

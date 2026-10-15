---
options:
  headingIds: flat
---

## Input

```md
# Product Documentation

## Installation

### Npm

### Yarn {#installation-yarn}

## Usage

### Npm
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
        "id": "product-documentation"
      },
      "Product Documentation"
    ],
    [
      "h2",
      {
        "id": "installation"
      },
      "Installation"
    ],
    [
      "h3",
      {
        "id": "npm"
      },
      "Npm"
    ],
    [
      "h3",
      {
        "id": "installation-yarn"
      },
      "Yarn"
    ],
    [
      "h2",
      {
        "id": "usage"
      },
      "Usage"
    ],
    [
      "h3",
      {
        "id": "npm-1"
      },
      "Npm"
    ]
  ]
}
```

## HTML

```html
<h1 id="product-documentation">Product Documentation</h1>
<h2 id="installation">Installation</h2>
<h3 id="npm">Npm</h3>
<h3 id="installation-yarn">Yarn</h3>
<h2 id="usage">Usage</h2>
<h3 id="npm-1">Npm</h3>
```

## Markdown

```md
# Product Documentation

## Installation

### Npm

### Yarn {#installation-yarn}

## Usage

### Npm
```

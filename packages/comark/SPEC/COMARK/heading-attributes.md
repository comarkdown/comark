## Input

```md
# Product Documentation {#prod-doc}

## Installation {#installation}

### Npm {#npm .highlight}

### Yarn {#installation-yarn}

## Usage {.lead data-level="2"}

## Installation
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
        "id": "prod-doc"
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
        "id": "npm",
        "class": "highlight"
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
        "id": "usage",
        "class": "lead",
        "data-level": "2"
      },
      "Usage"
    ],
    [
      "h2",
      {
        "id": "installation-1"
      },
      "Installation"
    ]
  ]
}
```

## HTML

```html
<h1 id="prod-doc">Product Documentation</h1>
<h2 id="installation">Installation</h2>
<h3 id="npm" class="highlight">Npm</h3>
<h3 id="installation-yarn">Yarn</h3>
<h2 id="usage" class="lead" data-level="2">Usage</h2>
<h2 id="installation-1">Installation</h2>
```

## Markdown

```md
# Product Documentation {#prod-doc}

## Installation

### Npm {#npm .highlight}

### Yarn

## Usage {.lead data-level="2"}

## Installation
```

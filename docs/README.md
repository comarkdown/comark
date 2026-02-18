# Comark Documentation

This directory contains comprehensive documentation for the Comark library, built with Docus.

## Documentation Structure

### Getting Started
- **[Documentation Home](./content/index.md)** - Start here for an overview
- **[Installation](./content/1.getting-started/1.installation.md)** - Set up Comark in your project

### Core API Documentation
1. **[Parse API](./content/4.api/1.parse.md)** - String and stream parsing
   - `parse()` - Parse markdown strings
   - `parseStream()` - Buffered stream parsing
   - `parseStreamIncremental()` - Incremental stream parsing
   - Types and interfaces

2. **[Auto-Close API](./content/4.api/2.auto-close.md)** - Handle incomplete syntax
   - `autoCloseMarkdown()` - Auto-close unclosed syntax
   - Streaming integration
   - Use cases

### Rendering
3. **[Vue Rendering](./content/3.rendering/1.vue.md)** - Render Comark content in Vue
   - Component props
   - Custom components
   - Slots and error handling

4. **[React Rendering](./content/3.rendering/2.react.md)** - Render Comark content in React
   - Component props
   - Custom components
   - Props conversion

## Quick Navigation

### By Use Case

**I want to...**

- **Install Comark** → [Installation Guide](./content/1.getting-started/1.installation.md)
- **Parse markdown from a string** → [Parse API](./content/4.api/1.parse.md)
- **Handle incomplete markdown** → [Auto-Close API](./content/4.api/2.auto-close.md)
- **Render Comark in Vue** → [Vue Rendering](./content/3.rendering/1.vue.md)
- **Render Comark in React** → [React Rendering](./content/3.rendering/2.react.md)
- **Create custom components** → [Vue - Custom Components](./content/3.rendering/1.vue.md#custom-components)

### By Technology

- **TypeScript** → All documentation includes TypeScript examples
- **Vue 3** → [Vue Rendering](./content/3.rendering/1.vue.md)
- **React** → [React Rendering](./content/3.rendering/2.react.md)

## Development

### Quick Start

```bash
# Install dependencies
pnpm install

# Start development server
pnpm run dev
```

Your documentation site will be running at `http://localhost:3000`

### Project Structure

```
docs/
├── content/              # Documentation markdown files
│   ├── index.md              # Documentation home
│   ├── 1.getting-started/    # Getting started guides
│   ├── 2.syntax/             # Syntax documentation
│   ├── 3.rendering/          # Vue and React rendering
│   ├── 4.api/                # API reference docs
│   └── 5.examples.md         # Examples
├── public/              # Static assets
└── package.json         # Dependencies and scripts
```

## API Reference

### Parse Utilities

| Function | Purpose | Documentation |
|----------|---------|---------------|
| `parse()` | Parse string | [Parse API](./content/4.api/1.parse.md) |
| `parseStream()` | Parse stream (buffered) | [Parse API](./content/4.api/1.parse.md) |
| `parseStreamIncremental()` | Parse stream (incremental) | [Parse API](./content/4.api/1.parse.md) |
| `autoCloseMarkdown()` | Auto-close syntax | [Auto-Close API](./content/4.api/2.auto-close.md) |

### Vue & React Components

| Export | Type | Documentation |
|--------|------|---------------|
| `Comark` (Vue) | Component | [Vue Rendering](./content/3.rendering/1.vue.md) |
| `Comark` (React) | Component | [React Rendering](./content/3.rendering/2.react.md) |

### Types

| Type | Purpose | Documentation |
|------|---------|---------------|
| `ParseResult` | Parse output | [API Reference](./content/4.api/3.reference.md) |
| `IncrementalParseResult` | Stream output | [API Reference](./content/4.api/3.reference.md) |
| `ComarkTree` | AST root | [API Reference](./content/4.api/3.reference.md) |
| `ComarkNode` | AST node | [API Reference](./content/4.api/3.reference.md) |

## Contributing to Documentation

When contributing documentation:

1. **Follow the existing structure** - Match the format of existing docs
2. **Include code examples** - Show both TypeScript and Vue examples
3. **Add cross-references** - Link to related documentation
4. **Test all examples** - Ensure code examples actually work
5. **Use proper markdown** - Follow Comark for components

### Documentation Standards

- **Headers**: Use sentence case (e.g., "Parse API" not "Parse api")
- **Code blocks**: Always specify language (```typescript, ```vue, etc.)
- **Links**: Use relative links within docs
- **Examples**: Include both simple and advanced examples
- **TypeScript**: Always include type annotations
- **Comments**: Explain non-obvious code

## Built With

This documentation site uses:

- [Nuxt 4](https://nuxt.com) - The web framework
- [Nuxt Content](https://content.nuxt.com/) - File-based CMS
- [Nuxt UI](https://ui.nuxt.com) - UI components
- [Tailwind CSS 4](https://tailwindcss.com/) - Utility-first CSS
- [Docus](https://docus.dev) - Documentation theme

## Deployment

Build for production:

```bash
pnpm run build
```

The built files will be in the `.output` directory, ready for deployment.

Deploy to:
- [Vercel](https://vercel.com)
- [Netlify](https://netlify.com)
- [Cloudflare Pages](https://pages.cloudflare.com)
- Any Node.js hosting

## Questions or Issues?

- **Documentation unclear?** [Open an issue](https://github.com/comarkdown/comark/issues)
- **Example doesn't work?** [Report it](https://github.com/comarkdown/comark/issues)
- **Want to contribute?** [Submit a PR](https://github.com/comarkdown/comark/pulls)

## License

Documentation is under the same license as the project (ISC).

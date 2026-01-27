# MDC Syntax Documentation

This directory contains comprehensive documentation for the MDC Syntax library, built with Docus.

## Documentation Structure

### Getting Started
- **[Documentation Home](./content/index.md)** - Start here for an overview
- **[Installation](./content/0.installation.md)** - Set up MDC Syntax in your project

### Core API Documentation
1. **[Parse API](./content/1.parse-api.md)** - String and stream parsing
   - `parse()` - Parse markdown strings
   - `parseStream()` - Buffered stream parsing
   - `parseStreamIncremental()` - Incremental stream parsing
   - Types and interfaces

2. **[Auto-Close API](./content/2.auto-close-api.md)** - Handle incomplete syntax
   - `autoCloseMarkdown()` - Auto-close unclosed syntax
   - `detectUnclosedSyntax()` - Detect unclosed elements
   - Streaming integration
   - Use cases

### Vue Integration
3. **[MDCRenderer Component](./content/3.mdc-renderer.md)** - Render MDC content
   - Component props
   - Custom components
   - Dynamic resolution
   - Slots and error handling

4. **[useMDCStream Composable](./content/4.use-mdc-stream.md)** - Reactive streaming
   - State management
   - Progress tracking
   - Multiple streams
   - TypeScript support

## Quick Navigation

### By Use Case

**I want to...**

- **Install MDC Syntax** → [Installation Guide](./content/0.installation.md)
- **Parse markdown from a string** → [Parse API - String Parsing](./content/1.parse-api.md#string-parsing)
- **Parse from a file stream** → [Parse API - Stream Parsing](./content/1.parse-api.md#stream-parsing)
- **Show real-time streaming content** → [useMDCStream Composable](./content/4.use-mdc-stream.md)
- **Render MDC in Vue** → [MDCRenderer Component](./content/3.mdc-renderer.md)
- **Handle incomplete markdown** → [Auto-Close API](./content/2.auto-close-api.md)
- **Create custom components** → [MDCRenderer - Custom Components](./content/3.mdc-renderer.md#custom-components)

### By Technology

- **TypeScript** → All documentation includes TypeScript examples
- **Vue 3** → [MDCRenderer](./content/3.mdc-renderer.md) and [useMDCStream](./content/4.use-mdc-stream.md)
- **Node.js Streams** → [Parse API - Stream Parsing](./content/1.parse-api.md#stream-parsing)
- **Web Streams (Fetch)** → [Parse API - Stream Parsing](./content/1.parse-api.md#stream-parsing)

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
│   ├── 0.index.md       # Documentation home
│   ├── 1.parse-api.md   # Parse API documentation
│   ├── 2.auto-close-api.md  # Auto-close API documentation
│   ├── 3.mdc-renderer.md    # MDCRenderer component docs
│   └── 4.use-mdc-stream.md  # useMDCStream composable docs
├── public/              # Static assets
└── package.json         # Dependencies and scripts
```

## API Reference

### Parse Utilities

| Function | Purpose | Documentation |
|----------|---------|---------------|
| `parse()` | Parse string | [Parse API](./content/1.parse-api.md#parse) |
| `parseStream()` | Parse stream (buffered) | [Parse API](./content/1.parse-api.md#parsestream) |
| `parseStreamIncremental()` | Parse stream (incremental) | [Parse API](./content/1.parse-api.md#parsestreamincremental) |
| `autoCloseMarkdown()` | Auto-close syntax | [Auto-Close API](./content/2.auto-close-api.md#autoclosedmarkdown) |
| `detectUnclosedSyntax()` | Detect unclosed | [Auto-Close API](./content/2.auto-close-api.md#detectunclosedsyntax) |

### Vue Components & Composables

| Export | Type | Documentation |
|--------|------|---------------|
| `MDCRenderer` | Component | [MDCRenderer](./content/3.mdc-renderer.md) |
| `useMDCStream` | Composable | [useMDCStream](./content/4.use-mdc-stream.md) |

### Types

| Type | Purpose | Documentation |
|------|---------|---------------|
| `ParseResult` | Parse output | [Parse API - Types](./content/1.parse-api.md#types) |
| `IncrementalParseResult` | Stream output | [Parse API - Types](./content/1.parse-api.md#types) |
| `MinimarkTree` | AST root | [Parse API - Types](./content/1.parse-api.md#minimarktree) |
| `MinimarkNode` | AST node | [Parse API - Types](./content/1.parse-api.md#minimarknode) |
| `MDCStreamState` | Stream state | [useMDCStream - State](./content/4.use-mdc-stream.md#state) |

## Contributing to Documentation

When contributing documentation:

1. **Follow the existing structure** - Match the format of existing docs
2. **Include code examples** - Show both TypeScript and Vue examples
3. **Add cross-references** - Link to related documentation
4. **Test all examples** - Ensure code examples actually work
5. **Use proper markdown** - Follow MDC syntax for components

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

- **Documentation unclear?** [Open an issue](https://github.com/nuxt-content/mdc-syntax/issues)
- **Example doesn't work?** [Report it](https://github.com/nuxt-content/mdc-syntax/issues)
- **Want to contribute?** [Submit a PR](https://github.com/nuxt-content/mdc-syntax/pulls)

## License

Documentation is under the same license as the project (ISC).

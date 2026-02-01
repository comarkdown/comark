# MDC Syntax - React Example

This is a React + Vite + TypeScript example demonstrating how to use MDC Syntax in a React application.

## Features

- ✨ Live markdown editor with real-time preview
- 🎨 Custom component support (Alert, Headings)
- 🌗 Dark mode support
- ⚡ Fast HMR with Vite
- 📝 TypeScript support
- 💨 Tailwind CSS for styling

## Getting Started

### Installation

```bash
# Install dependencies
pnpm install
```

### Development

```bash
# Start dev server
pnpm dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

### Build

```bash
# Build for production
pnpm build

# Preview production build
pnpm preview
```

## Usage

### Basic Usage

```tsx
import { MDC } from 'mdc-syntax/react'

export default function App() {
  const markdown = `# Hello **World**`
  return <MDC value={markdown} />
}
```

### With Custom Components

```tsx
import { MDC } from 'mdc-syntax/react'

const CustomAlert = ({ type, children }) => (
  <div className={`alert alert-${type}`}>
    {children}
  </div>
)

export default function App() {
  const markdown = `
    # My Document

    ::alert{type="info"}
    This is a custom alert component!
    ::
  `

  return (
    <MDC
      value={markdown}
      components={{ alert: CustomAlert }}
    />
  )
}
```

### With MDCRenderer (Lower-level API)

```tsx
import { MDCRenderer } from 'mdc-syntax/react'
import { parse } from 'mdc-syntax'

export default function App() {
  const markdown = `# Hello **World**`
  const ast = parse(markdown)

  return <MDCRenderer body={ast.body} />
}
```

## Custom Components

The example includes two custom components:

1. **CustomAlert** - Renders MDC alert blocks with different types (info, warning, error, success)
2. **CustomHeading** - Adds an emoji prefix to all H1 headings

Toggle the "Use custom components" checkbox to see the difference!

## Learn More

- [MDC Syntax Documentation](https://github.com/nuxt-content/mdc-syntax)
- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)

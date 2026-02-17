# React Rendering Guide

Complete guide for rendering Comark AST in React applications.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Custom Components](#custom-components)
- [Dynamic Component Resolution](#dynamic-component-resolution)
- [Props Conversion](#props-conversion)
- [Streaming Mode](#streaming-mode)
- [High-Level Comark Component](#high-level-mdc-component)
- [Syntax Highlighting](#syntax-highlighting)
- [Prose Components](#prose-components)
- [Custom Props Handling](#custom-props-handling)
- [CSS Class Name](#css-class-name)

---

## Basic Usage

Use the `Comark` component to render markdown:

```tsx
import { Comark } from 'comark/react'

const content = `
# Hello World

This is **markdown** content.

::alert{type="info"}
Important message
::
`

export default function App() {
  return <Comark markdown={content} />
}
```

---

## Custom Components

Map custom React components to Comark elements:

```tsx
import { Comark } from 'comark/react'
import CustomHeading from './CustomHeading'
import CustomAlert from './CustomAlert'
import CustomCard from './CustomCard'

const customComponents = {
  h1: CustomHeading,
  h2: CustomHeading,
  alert: CustomAlert,
  card: CustomCard,
}

export default function App({ content }) {
  return (
    <Comark
      markdown={content}
      components={customComponents}
    />
  )
}
```

### Custom Component Example

```tsx
// CustomHeading.tsx
import React from 'react'

interface Props {
  __node: any  // Comark node
  id?: string
  children: React.ReactNode
}

export default function CustomHeading({ __node, id, children }: Props) {
  const tag = __node[0]  // h1, h2, etc.
  const Component = tag as keyof JSX.IntrinsicElements

  return (
    <Component id={id} className="custom-heading">
      {children}
    </Component>
  )
}
```

**Styled Component:**

```tsx
import styled from 'styled-components'

const StyledHeading = styled.h1<{ level: number }>`
  font-family: 'Inter', sans-serif;
  font-weight: 700;
  font-size: ${props => 3 - props.level * 0.25}rem;
  margin-bottom: 1rem;
  color: #1a202c;
`

export default function CustomHeading({ __node, children }: Props) {
  const tag = __node[0]
  const level = parseInt(tag[1])  // Extract level from 'h1', 'h2', etc.

  return (
    <StyledHeading as={tag} level={level}>
      {children}
    </StyledHeading>
  )
}
```

### Alert Component Example

```tsx
// CustomAlert.tsx
import React from 'react'
import './Alert.css'

interface AlertProps {
  type?: 'info' | 'warning' | 'error' | 'success'
  children: React.ReactNode
}

export default function CustomAlert({ type = 'info', children }: AlertProps) {
  const icons = {
    info: 'ℹ️',
    warning: '⚠️',
    error: '❌',
    success: '✅',
  }

  return (
    <div className={`alert alert-${type}`} role="alert">
      <div className="alert-icon">{icons[type]}</div>
      <div className="alert-content">{children}</div>
    </div>
  )
}
```

---

## Dynamic Component Resolution

Load components dynamically using `componentsManifest`:

```tsx
import { Comark } from 'comark/react'

const componentMap = {
  'alert': () => import('./Alert'),
  'card': () => import('./Card'),
  'button': () => import('./Button'),
}

async function loadComponent(name: string) {
  if (componentMap[name]) {
    return componentMap[name]()
  }
  throw new Error(`Component ${name} not found`)
}

export default function App({ content }) {
  return (
    <Comark
      markdown={content}
      componentsManifest={loadComponent}
    />
  )
}
```

---

## Props Conversion

React renderer handles HTML attribute conversion automatically:

### Attribute Mapping

```tsx
// Markdown attribute → React prop
{class="foo"}           → className="foo"
{tabindex="0"}          → tabIndex={0}
{style="..."}           → style={{...}}  (converted to object)
{:bool="true"}          → bool={true}    (parsed from string)
{:count="5"}            → count={5}      (parsed as number)
{:data='{"key":"val"}'} → data={{key:"val"}} (parsed as object)
```

### Style Conversion

```tsx
// Input: style="color: red; font-size: 16px"
// Output: style={{ color: 'red', fontSize: '16px' }}

// Custom CSS properties preserved:
// Input: style="--custom-color: blue"
// Output: style={{ '--custom-color': 'blue' }}
```

### Boolean Props

```tsx
// Markdown: **text**{:disabled}
// React prop: disabled={true}

// Markdown: [link](url){:external}
// React prop: external={true}
```

### Number Props

```tsx
// Markdown: ::component{:count="5"}
// React prop: count={5}

// Markdown: ::component{:max="100"}
// React prop: max={100}
```

### Object/Array Props

```tsx
// Markdown: ::component{:config='{"theme":"dark"}'}
// React prop: config={{theme:"dark"}}

// Markdown: ::component{:items='["a","b","c"]'}
// React prop: items={["a","b","c"]}
```

---

## Streaming Mode

Use the `Comark` component with reactive state for streaming content:

```tsx
import { useState, useEffect } from 'react'
import { Comark } from 'comark/react'

export default function StreamingContent() {
  const [content, setContent] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadContent() {
      const response = await fetch('/api/content.md')
      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        setContent(prev => prev + decoder.decode(value))
      }

      setIsLoading(false)
    }

    loadContent()
  }, [])

  return (
    <>
      {isLoading && <div>Loading...</div>}
      <Comark markdown={content} />
    </>
  )
}
```

---

## Prose Components

The `Comark` component uses built-in prose styling automatically. You can override with custom components:

```tsx
import { Comark } from 'comark/react'
import CustomAlert from './CustomAlert'

const components = {
  alert: CustomAlert,  // Override or add custom components
}

export default function App({ content }) {
  return <Comark markdown={content} components={components} />
}
```

### Tailwind CSS Prose

```tsx
import { Comark } from 'comark/react'

export default function App({ content }) {
  return (
    <article className="prose prose-lg dark:prose-dark max-w-none">
      <Comark markdown={content} />
    </article>
  )
}
```

---

## Custom Props Handling

Access props in custom components:

```tsx
// CustomAlert.tsx
interface AlertProps {
  type?: string        // From {type="info"}
  bool?: boolean       // From {bool} → :bool="true"
  count?: number       // From {:count="5"}
  data?: object        // From {:data='{"key":"val"}'}
  __node?: any         // Original Comark node
  children: React.ReactNode
}

export default function CustomAlert({
  type = 'info',
  bool,
  count,
  data,
  __node,
  children
}: AlertProps) {
  return (
    <div
      className={`alert alert-${type}`}
      data-bool={bool}
      data-count={count}
      data-info={JSON.stringify(data)}
      role="alert"
    >
      {children}
    </div>
  )
}
```

### Property Types

- `:bool="true"` → `bool={true}` (boolean)
- `:count="5"` → `count={5}` (number)
- `:obj='{"key":"val"}'` → `obj={{key:"val"}}` (object)
- `attr="value"` → `attr="value"` (string)

### Accessing Node Structure

```tsx
interface Props {
  __node?: any
  children: React.ReactNode
}

export default function Component({ __node, children }: Props) {
  // Node structure: [tag, props, ...children]
  const tag = __node?.[0]
  const nodeProps = __node?.[1] || {}
  const nodeChildren = __node?.slice(2) || []

  return (
    <div data-tag={tag}>
      {children}
    </div>
  )
}
```

### Working with Complex Props

```tsx
// DataTable.tsx
interface DataTableProps {
  columns?: string[]   // From {:columns='["Name","Age"]'}
  sortable?: boolean   // From {sortable}
  striped?: boolean    // From {striped}
  children: React.ReactNode
}

export default function DataTable({
  columns = [],
  sortable = false,
  striped = false,
  children
}: DataTableProps) {
  return (
    <table className={striped ? 'table-striped' : ''}>
      {columns.length > 0 && (
        <thead>
          <tr>
            {columns.map((col, i) => (
              <th key={i}>
                {col}
                {sortable && <button>↕</button>}
              </th>
            ))}
          </tr>
        </thead>
      )}
      <tbody>{children}</tbody>
    </table>
  )
}
```

**Usage in Markdown:**

```markdown
::data-table{:columns='["Name", "Age", "Email"]' sortable striped}
Table content here
::
```

---

## CSS Class Name

Add custom wrapper class:

```tsx
<Comark
  markdown={content}
  className="prose dark:prose-dark"
/>
```

### With Tailwind CSS

```tsx
<Comark
  markdown={content}
  className="prose prose-slate lg:prose-xl dark:prose-invert max-w-none"
/>
```

---

[← Back to Main Skills Guide](../../SKILLS.md)

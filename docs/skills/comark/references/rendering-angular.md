# Angular Rendering Guide

Complete guide for rendering Comark AST in Angular 17+ applications.

## Table of Contents

- [Basic Usage](#basic-usage)
- [Custom Components](#custom-components)
- [Dynamic Component Resolution](#dynamic-component-resolution)
- [Content Projection (Slots)](#content-projection-slots)
- [Streaming Mode](#streaming-mode)
- [Prose Components](#prose-components)
- [Props & Inputs](#props--inputs)
- [Data Binding](#data-binding)
- [Pre-configured Components](#pre-configured-components)

---

## Basic Usage

Use the `Markdown` standalone component to render markdown:

```typescript
// app.component.ts
import { Component } from '@angular/core'
import { Markdown } from '@comark/angular'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Markdown],
  template: `
    <comark-markdown [value]="content" />
  `,
})
export class AppComponent {
  content = `
# Hello World

This is **markdown** content.

::alert{type="info"}
Important message
::
`
}
```

### With Pre-parsed AST

Use `MarkdownParsed` when you already have a parsed Comark tree:

```typescript
import { Component } from '@angular/core'
import { MarkdownParsed } from '@comark/angular'
import { parse } from 'comark'
import type { MarkdownTree } from 'comark'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [MarkdownParsed],
  template: `
    @if (tree) {
      <comark-markdown-parsed [value]="tree" [components]="customComponents" />
    }
  `,
})
export class AppComponent {
  tree: MarkdownTree | null = null

  async ngOnInit() {
    this.tree = await parse('# Hello World')
  }
}
```

---

## Custom Components

Map custom Angular components to Comark element tags:

```typescript
import { Component, Type } from '@angular/core'
import { Markdown } from '@comark/angular'
import { CustomAlertComponent } from './custom-alert.component'
import { CustomCardComponent } from './custom-card.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Markdown],
  template: `
    <comark-markdown [value]="content" [components]="customComponents" />
  `,
})
export class AppComponent {
  content = '::alert{type="info"}\nHello\n::'

  customComponents: Record<string, Type<any>> = {
    alert: CustomAlertComponent,
    card: CustomCardComponent,
  }
}
```

### Component Resolution Order

Components are resolved by checking these keys in order:
1. `Prose{PascalTag}`, e.g., `ProseH1` for `<h1>` tags
2. `tag`, e.g., `alert` for `::alert` components
3. `PascalTag`, e.g., `Alert` for `::alert` components

### Custom Component Example

Custom components receive Comark element attributes as `@Input()` properties. Children are projected via `<ng-content />`:

```typescript
// custom-alert.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'custom-alert',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="'alert alert-' + type" role="alert">
      <ng-content />
    </div>
  `,
  styles: [`
    .alert {
      display: flex;
      padding: 1rem;
      border-radius: 0.5rem;
      margin-bottom: 1rem;
    }
    .alert-info { background-color: #e3f2fd; color: #1976d2; }
    .alert-warning { background-color: #fff3e0; color: #f57c00; }
    .alert-error { background-color: #ffebee; color: #d32f2f; }
    .alert-success { background-color: #e8f5e9; color: #388e3c; }
  `],
})
export class CustomAlertComponent {
  @Input() type: string = 'info'
  @Input() __node: any
}
```

### Custom Heading Example

```typescript
// custom-heading.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'custom-heading',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <h1 [id]="id" class="custom-heading">
      <ng-content />
    </h1>
  `,
  styles: [`
    .custom-heading {
      font-family: 'Inter', sans-serif;
      font-weight: 700;
      margin-bottom: 1rem;
    }
  `],
})
export class CustomHeadingComponent {
  @Input() id?: string
  @Input() __node: any
}
```

---

## Dynamic Component Resolution

Components are resolved at runtime. The `components` input is a plain `Record<string, Type<any>>` mapping tag names to Angular component classes.

The renderer uses Angular's `createComponent` API to dynamically instantiate components, and `reflectComponentType` to discover which `@Input()` properties the component accepts. Only matching inputs are set.

```typescript
import { Component, Type } from '@angular/core'
import { Markdown } from '@comark/angular'

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [Markdown],
  template: `
    <comark-markdown [value]="content" [components]="componentMap" />
  `,
})
export class DocsComponent {
  content = '::tabs\n#tab1\nContent 1\n#tab2\nContent 2\n::'

  componentMap: Record<string, Type<any>> = {}

  async ngOnInit() {
    // Lazy-load components
    const { TabsComponent } = await import('./tabs.component')
    const { AlertComponent } = await import('./alert.component')
    this.componentMap = {
      tabs: TabsComponent,
      alert: AlertComponent,
    }
  }
}
```

---

## Content Projection (Slots)

Comark named slots map to Angular's content projection. The renderer handles slot extraction automatically.

### Markdown with Slots

```markdown
::card
#header
## Card Title

#content
Main content here with **markdown** support

#footer
Footer text
::
```

### Custom Component with Slots

Named slots are rendered into `<div slot="name" style="display: contents">` elements and appended to the component's host element. Use CSS attribute selectors or `@ContentChildren` to target them:

```typescript
// card.component.ts
import { Component, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'custom-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="card">
      <div class="card-header">
        <ng-content select="[slot=header]" />
      </div>
      <div class="card-content">
        <ng-content />
      </div>
      <div class="card-footer">
        <ng-content select="[slot=footer]" />
      </div>
    </div>
  `,
  styles: [`
    .card {
      border: 1px solid #e5e7eb;
      border-radius: 0.5rem;
      overflow: hidden;
    }
    .card-header {
      background-color: #f9fafb;
      padding: 1rem;
      border-bottom: 1px solid #e5e7eb;
    }
    .card-content { padding: 1rem; }
    .card-footer {
      background-color: #f9fafb;
      padding: 1rem;
      border-top: 1px solid #e5e7eb;
    }
  `],
})
export class CardComponent {}
```

### Nested Slots

```markdown
::tabs
#tab1
### First Tab
Content for tab 1

#tab2
### Second Tab
Content for tab 2
::
```

---

## Streaming Mode

Enable streaming mode for real-time rendering of content (e.g., AI-generated output):

```typescript
import { Component } from '@angular/core'
import { Markdown } from '@comark/angular'

@Component({
  selector: 'app-streaming',
  standalone: true,
  imports: [Markdown],
  template: `
    <comark-markdown
      [value]="content"
      [streaming]="isStreaming"
      [caret]="isStreaming"
    />
  `,
})
export class StreamingComponent {
  content = ''
  isStreaming = true

  async ngOnInit() {
    const response = await fetch('/api/stream')
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    while (true) {
      const { done, value } = await reader.read()
      if (done) break
      this.content += decoder.decode(value)
    }

    this.isStreaming = false
  }
}
```

### Caret Configuration

The `caret` input controls the streaming cursor indicator:

```typescript
// Boolean: use default pulsing caret
<comark-markdown [value]="content" [streaming]="true" [caret]="true" />

// Object: custom CSS class for the caret
<comark-markdown [value]="content" [streaming]="true" [caret]="{ class: 'my-caret' }" />
```

The caret is a `<span>` with a pulsing CSS animation, automatically appended to the last text node in the AST during streaming.

### Summary Mode

Render only content before `<!-- more -->`:

```typescript
<comark-markdown [value]="content" [summary]="true" />
```

---

## Prose Components

The `MarkdownParsed` renders standard HTML elements natively. Override them with custom components using the `Prose` prefix:

```typescript
import { Component, Type } from '@angular/core'
import { Markdown } from '@comark/angular'
import { ProseH1Component } from './prose/prose-h1.component'
import { ProseCodeComponent } from './prose/prose-code.component'

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [Markdown],
  template: `
    <comark-markdown [value]="content" [components]="components" />
  `,
})
export class DocsComponent {
  content = '# Hello World'

  components: Record<string, Type<any>> = {
    ProseH1: ProseH1Component,
    ProseCode: ProseCodeComponent,
  }
}
```

---

## Props & Inputs

Custom components receive Comark element attributes as `@Input()` properties. The renderer uses `reflectComponentType` to discover accepted inputs and only sets matching ones.

```typescript
// data-table.component.ts
import { Component, Input, ChangeDetectionStrategy } from '@angular/core'

@Component({
  selector: 'data-table',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <table>
      @if (columns && columns.length > 0) {
        <thead>
          <tr>
            @for (col of columns; track col) {
              <th>{{ col }}</th>
            }
          </tr>
        </thead>
      }
      <tbody>
        <ng-content />
      </tbody>
    </table>
  `,
})
export class DataTableComponent {
  @Input() columns?: string[]   // From {:columns='["Name","Age"]'}
  @Input() sortable?: boolean   // From {sortable}
  @Input() __node?: any         // Original Comark node
}
```

**Usage in Markdown:**

```markdown
::data-table{:columns='["Name", "Age", "Email"]' sortable}
Table content here
::
```

### Property Parsing Rules

- Props starting with `:` are parsed as booleans/JSON
- Standard HTML attributes work normally
- `__node` provides access to the raw AST node (set automatically if the component declares it as an `@Input()`)

### Accessing Node Structure

```typescript
@Input() __node?: any

// Node structure: [tag, props, ...children]
get tag() { return this.__node?.[0] }
get nodeProps() { return this.__node?.[1] || {} }
get nodeChildren() { return this.__node?.slice(2) || [] }
```

---

## Data Binding

The `data` input allows passing ambient data for `:binding` resolution in markdown:

```typescript
import { Component } from '@angular/core'
import { Markdown } from '@comark/angular'
import binding, { Binding } from '@comark/angular/plugins/binding'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Markdown],
  template: `
    <comark-markdown
      [value]="content"
      [plugins]="plugins"
      [components]="components"
      [data]="data"
    />
  `,
})
export class AppComponent {
  content = 'Hello {{ user.name }}, you have {{ count }} messages.'

  plugins = [binding()]
  components = { Binding }
  data = {
    user: { name: 'Alice' },
    count: 42,
  }
}
```

---

## Pre-configured Components

Use `defineMarkdownComponent` or `defineMarkdownParsedComponent` to create pre-configured components with default plugins and component mappings:

### defineMarkdownComponent

```typescript
// docs-comark.component.ts
import { defineMarkdownComponent } from '@comark/angular'
import math, { Math } from '@comark/angular/plugins/math'
import mermaid, { Mermaid } from '@comark/angular/plugins/mermaid'

export const DocsComark = defineMarkdownComponent({
  name: 'docs-comark',
  plugins: [math(), mermaid()],
  components: { Math, Mermaid },
  class: 'prose dark:prose-invert',
})
```

Use the pre-configured component:

```typescript
import { Component } from '@angular/core'
import { DocsComark } from './docs-comark.component'

@Component({
  selector: 'app-docs',
  standalone: true,
  imports: [DocsComark],
  template: `
    <docs-comark [value]="content" />
  `,
})
export class DocsComponent {
  content = '# Math: $E = mc^2$'
}
```

Instance-level `components` and `plugins` are merged with the config-level defaults at runtime.

### defineMarkdownParsedComponent

```typescript
import { defineMarkdownParsedComponent } from '@comark/angular'
import { Math } from '@comark/angular/plugins/math'

export const DocsRenderer = defineMarkdownParsedComponent({
  name: 'docs-renderer',
  components: { Math },
})
```

---

## Plugins

### Math (KaTeX)

```typescript
import { Component } from '@angular/core'
import { Markdown } from '@comark/angular'
import math, { Math } from '@comark/angular/plugins/math'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Markdown],
  template: `
    <comark-markdown [value]="content" [plugins]="plugins" [components]="components" />
  `,
})
export class AppComponent {
  content = 'Inline $E = mc^2$ and block:\n\n$$\n\\int_0^\\infty e^{-x} dx = 1\n$$'
  plugins = [math()]
  components = { Math }
}
```

> **Note:** Import `katex/dist/katex.min.css` in your global styles to load KaTeX styles.

### Mermaid

```typescript
import { Component } from '@angular/core'
import { Markdown } from '@comark/angular'
import mermaid, { Mermaid } from '@comark/angular/plugins/mermaid'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [Markdown],
  template: `
    <comark-markdown [value]="content" [plugins]="plugins" [components]="components" />
  `,
})
export class AppComponent {
  content = '```mermaid\ngraph TD\n  A --> B\n```'
  plugins = [mermaid()]
  components = { Mermaid }
}
```

The Mermaid component includes automatic dark mode support: it watches the `<html>` element for `.dark` class changes and re-renders diagrams accordingly.

### Binding

```typescript
import binding, { Binding } from '@comark/angular/plugins/binding'

// See the "Data Binding" section above for full usage.
```

---

## Performance

All `@comark/angular` components use:

- **Standalone Components**: no `NgModule` required
- **`ChangeDetectionStrategy.OnPush`**: minimal change detection overhead
- **Dynamic component creation** via `createComponent`: efficient runtime instantiation
- **`reflectComponentType`**: only set inputs the component actually declares

---

[← Back to Main Skills Guide](../SKILL.md)

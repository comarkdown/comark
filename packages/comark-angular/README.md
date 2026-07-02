<img src="https://github.com/comarkdown/comark/blob/main/assets/banner.jpg" width="100%" alt="Comark banner" />

# @comark/angular

[![npm version](https://img.shields.io/npm/v/@comark/angular?color=black)](https://npmx.dev/@comark/angular)
[![npm downloads](https://img.shields.io/npm/dm/@comark/angular?color=black)](https://npm.chart.dev/@comark/angular)
[![CI](https://img.shields.io/github/actions/workflow/status/comarkdown/comark/ci.yml?branch=main&color=black)](https://github.com/comarkdown/comark/actions/workflows/ci.yml)
[![Documentation](https://img.shields.io/badge/Documentation-black?logo=readme&logoColor=white)](https://comark.dev/rendering/angular)
[![license](https://img.shields.io/github/license/comarkdown/comark?color=black)](https://github.com/comarkdown/comark/blob/main/LICENSE)

Angular renderer for [Comark](https://comark.dev) — render markdown with custom standalone components, streaming support, and SSR.

## Features

- 🧩 `<comark>` component for one-shot markdown rendering
- 🎯 Map any Comark tag to a custom Angular component
- 🌊 Streaming-friendly with auto-close and caret support
- 🖥️ SSR-safe with Angular 17+ standalone components
- 🔌 Plugin ecosystem (math, mermaid, highlight, binding…)
- 🎯 Full TypeScript support

## Installation

```bash
npm install @comark/angular
# or
pnpm add @comark/angular
```

## Usage

```typescript
import { Component } from '@angular/core'
import { ComarkComponent } from '@comark/angular'
import math, { Math } from '@comark/angular/plugins/math'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ComarkComponent],
  template: `<comark [markdown]="content" [components]="{ Math }" [plugins]="[math()]" />`,
})
export class AppComponent {
  content = `# Hello\n\nThis is **Comark** in Angular.`
}
```

### Custom components

```typescript
import { Component } from '@angular/core'
import { ComarkComponent } from '@comark/angular'
import { AlertComponent } from './alert.component'

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [ComarkComponent],
  template: `<comark [markdown]="content" [components]="{ alert: AlertComponent }" />`,
})
export class AppComponent {
  content = `
::alert{type="warning"}
Heads up!
::
`
}
```

### Streaming

```html
<comark [markdown]="content" [streaming]="isStreaming" caret />
```

## Documentation

Full guide and API reference at [comark.dev/rendering/angular](https://comark.dev/rendering/angular).

## License

Made with ❤️

Published under [MIT License](https://github.com/comarkdown/comark/blob/main/LICENSE).

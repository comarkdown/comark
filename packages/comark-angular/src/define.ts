import { Component, Input, ChangeDetectionStrategy, Type } from '@angular/core'
import type { ParseOptions } from 'comark'
import { ComarkComponent } from './components/comark.component.ts'
import { ComarkRendererComponent } from './components/comark-renderer.component.ts'

export interface DefineComarkComponentOptions extends ParseOptions {
  /** Display name for debugging (used as Angular selector). */
  name?: string
  /** Pre-configured component mappings. */
  components?: Record<string, Type<any>>
  /** Additional CSS class for the wrapper. */
  class?: string
}

export interface DefineComarkRendererOptions {
  /** Display name for debugging (used as Angular selector). */
  name?: string
  /** Pre-configured component mappings. */
  components?: Record<string, Type<any>>
  /** Additional CSS class for the wrapper. */
  class?: string
}

/**
 * Create a pre-configured Comark component with default options, plugins, and components.
 *
 * The returned class extends `ComarkComponent` and merges the config-level
 * defaults with any per-instance `@Input()` values at runtime.
 *
 * @example
 * ```typescript
 * import { defineComarkComponent } from '@comark/angular'
 * import math, { Math } from '@comark/angular/plugins/math'
 *
 * export const DocsComark = defineComarkComponent({
 *   name: 'DocsComark',
 *   plugins: [math()],
 *   components: { Math },
 *   class: 'prose dark:prose-invert',
 * })
 * ```
 */
export function defineComarkComponent(config: DefineComarkComponentOptions = {}): Type<ComarkComponent> {
  const { components: configComponents = {}, class: configClass, plugins: configPlugins = [], ...parseOptions } = config

  @Component({
    selector: 'comark-defined',
    standalone: true,
    imports: [ComarkRendererComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      @if (tree) {
        <comark-renderer
          [tree]="tree"
          [components]="mergedComponents"
          [streaming]="streaming"
          [caret]="caret"
          [data]="data"
        />
      }
    `,
    host: {
      '[class]': 'hostClass',
    },
  })
  class DefinedComarkComponent extends ComarkComponent {
    /** Instance-level components that are merged with config-level components. */
    @Input() override components: Record<string, Type<any>> = {}

    get mergedComponents(): Record<string, Type<any>> {
      return { ...configComponents, ...this.components }
    }

    get hostClass(): string {
      return configClass || ''
    }

    override ngOnChanges(changes: any): void {
      // Merge config-level options and plugins with instance-level ones
      if (!this.options || Object.keys(this.options).length === 0) {
        this.options = { ...parseOptions }
      } else {
        this.options = { ...parseOptions, ...this.options }
      }

      if (!this.plugins || this.plugins.length === 0) {
        this.plugins = [...configPlugins]
      } else {
        this.plugins = [...configPlugins, ...this.plugins]
      }

      super.ngOnChanges(changes)
    }
  }

  return DefinedComarkComponent as any
}

/**
 * Create a pre-configured ComarkRenderer component with default component mappings.
 *
 * @example
 * ```typescript
 * import { defineComarkRendererComponent } from '@comark/angular'
 * import { Math } from '@comark/angular/plugins/math'
 *
 * export const DocsRenderer = defineComarkRendererComponent({
 *   name: 'DocsRenderer',
 *   components: { Math },
 * })
 * ```
 */
export function defineComarkRendererComponent(config: DefineComarkRendererOptions = {}): Type<ComarkRendererComponent> {
  const { components: configComponents = {}, class: configClass } = config

  @Component({
    selector: 'comark-renderer-defined',
    standalone: true,
    imports: [ComarkRendererComponent],
    changeDetection: ChangeDetectionStrategy.OnPush,
    template: `
      <comark-renderer
        [tree]="tree"
        [components]="mergedComponents"
        [streaming]="streaming"
        [caret]="caret"
        [data]="data"
      />
    `,
    host: {
      '[class]': 'hostClass',
    },
  })
  class DefinedComarkRendererComponent extends ComarkRendererComponent {
    /** Instance-level components that are merged with config-level components. */
    @Input() override components: Record<string, Type<any>> = {}

    get mergedComponents(): Record<string, Type<any>> {
      return { ...configComponents, ...this.components }
    }

    get hostClass(): string {
      return configClass || ''
    }
  }

  return DefinedComarkRendererComponent as any
}

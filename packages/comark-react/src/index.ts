import React from 'react'
import { Comark } from './components/Comark'
import type { ComarkProps } from './components/Comark'
import type { ParseOptions } from 'comark'

export { ComarkRenderer } from './components/ComarkRenderer'
export { ComarkClient } from './components/ComarkClient'
export { Comark }
export type * from 'comark'

interface DefineComarkComponentOptions extends ParseOptions {
  name?: string
  components?: Record<string, React.ComponentType<any>>
}

/**
 * Create a pre-configured Comark component with default options, plugins, and components.
 *
 * @example
 * ```tsx
 * import { defineComarkComponent } from '@comark/react'
 * import math, { Math } from '@comark/react/plugins/math'
 * import highlight from '@comark/react/plugins/highlight'
 *
 * export const AppComark = defineComarkComponent({
 *   name: 'AppComark',
 *   plugins: [
 *     math(),
 *     highlight({
 *       themes: {
 *         light: 'github-light',
 *         dark: 'github-dark',
 *       },
 *     }),
 *   ],
 *   components: { Math },
 * })
 * ```
 */
export function defineComarkComponent(config: DefineComarkComponentOptions = {}) {
  const { name, components: configComponents = {}, ...parseOptions } = config

  const ComarkComponent: React.FC<ComarkProps> = (props) => {
    // Merge options (excluding plugins)
    const mergedOptions: Exclude<ParseOptions, 'plugins'> = {
      ...parseOptions,
      ...props.options,
    }

    // Merge plugins (config plugins + prop plugins)
    const mergedPlugins = [
      ...(config.plugins || []),
      ...(props.plugins || []),
    ]

    // Merge components (props override config)
    const mergedComponents = {
      ...configComponents,
      ...props.components,
    }

    return React.createElement(Comark, {
      ...props,
      options: mergedOptions,
      plugins: mergedPlugins,
      components: mergedComponents,
    })
  }

  ComarkComponent.displayName = name || 'ComarkComponent'

  return ComarkComponent
}

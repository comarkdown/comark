import React from 'react'
import { Comark } from './components/Comark'
import type { ComarkProps } from './components/Comark'
import type { ParseOptions } from '../types'

export { ComarkRenderer } from './components/ComarkRenderer'
export { Comark }

interface DefineComarkComponentOptions extends ParseOptions {
  name?: string
  components?: Record<string, React.ComponentType<any>>
}

/**
 * Create a pre-configured Comark component with default options, plugins, and components.
 *
 * @example
 * ```tsx
 * import { defineComarkComponent } from 'comark/react'
 * import math from '@comark/math'
 * import highlight from 'comark/plugins/highlight'
 * import { Math } from '@comark/math/react'
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
    // Merge options
    const mergedOptions: ParseOptions = {
      ...parseOptions,
      ...props.options,
      plugins: [
        ...(config.plugins || []),
        ...(props.options?.plugins || []),
      ],
    }

    // Merge components (props override config)
    const mergedComponents = {
      ...configComponents,
      ...props.components,
    }

    return React.createElement(Comark, {
      ...props,
      options: mergedOptions,
      components: mergedComponents,
    })
  }

  ComarkComponent.displayName = name || 'ComarkComponent'

  return ComarkComponent
}

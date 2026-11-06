/** Synchronous markdown-it / markdown-exit adapter for Comark component syntax. */
import { createMarkdownItComponents } from '../../internal/parse/components.ts'
import { parseYaml } from '../../internal/parse/yaml.ts'

export const markdownItComponents = createMarkdownItComponents(parseYaml)

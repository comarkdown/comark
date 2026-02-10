import { standardProseComponents } from './index'
import ProsePreShiki from './prose/ProsePreShiki.vue'

export const proseStreamComponents = {
  ...standardProseComponents,
  pre: ProsePreShiki,
}

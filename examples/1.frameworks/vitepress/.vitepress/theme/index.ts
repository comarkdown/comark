import DefaultTheme from 'vitepress/theme'
import type { Theme } from 'vitepress'
import Alert from '../components/Alert.vue'

export default {
  extends: DefaultTheme,
  enhanceApp({ app }) {
    app.component('Alert', Alert)
  },
} satisfies Theme

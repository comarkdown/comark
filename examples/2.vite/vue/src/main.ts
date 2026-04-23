import { createApp } from 'vue'
import App from './App.vue'
import ui from '@nuxt/ui/vue-plugin'
import router from './router'

createApp(App).use(ui).use(router).mount('#app')

import { createRouter, createWebHashHistory } from 'vue-router'
import IndexPage from './pages/index.vue'
import BlogPost from './pages/blog/slug.vue'

export default createRouter({
  history: createWebHashHistory(),
  routes: [
    { path: '/', component: IndexPage },
    { path: '/blog/:slug', component: BlogPost },
  ],
})

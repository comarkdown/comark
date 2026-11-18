import type { Routes } from '@angular/router'
import { HomeComponent } from './pages/home.component'
import { BlogPostComponent } from './pages/blog-post.component'

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'blog/:slug', component: BlogPostComponent },
]

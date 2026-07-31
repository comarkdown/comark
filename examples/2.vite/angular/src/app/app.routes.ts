import type { Routes } from '@angular/router'
import { HomeComponent } from './pages/home.component'
import { BlogPostComponent } from './pages/blog-post.component'
import { SyntaxComponent } from './pages/syntax.component'
import { LiveComponent } from './pages/live.component'

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'post/:slug', component: BlogPostComponent },
  { path: 'syntax', component: SyntaxComponent },
  { path: 'live', component: LiveComponent },
]

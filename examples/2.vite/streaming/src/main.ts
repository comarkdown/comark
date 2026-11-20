import 'zone.js'
import './index.css'
import { bootstrapApplication } from '@angular/platform-browser'
import { createApp } from 'vue'
import { createRoot } from 'react-dom/client'
import { createElement } from 'react'
import { mount } from 'svelte'
import VueColumn from './components/VueColumn.vue'
import ReactColumn from './components/ReactColumn.tsx'
import SvelteColumn from './components/SvelteColumn.svelte'
import { AngularColumn } from './components/AngularColumn'
import { mountEditor } from './editor'

mountEditor(document.getElementById('editor')!)
createApp(VueColumn).mount('#vue')
createRoot(document.getElementById('react')!).render(createElement(ReactColumn))
mount(SvelteColumn, { target: document.getElementById('svelte')! })
bootstrapApplication(AngularColumn).catch((err) => console.error(err))

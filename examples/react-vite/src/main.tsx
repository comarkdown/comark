import { createRoot } from 'react-dom/client'
import { MDC } from 'mdc-syntax/react'

const el = document.getElementById('root')!

createRoot(el).render(<MDC markdown="# Hello *World*" />)

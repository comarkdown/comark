/// <reference types="vite/client" />
/**
 * Client entry injected by `comarkDevtools()` in development.
 * Connects `globalThis.comarkContext` to the Vite HMR channel so the
 * DevTools panel can list and edit live documents.
 */
import { connectDevtools } from './bridge.ts'

connectDevtools(import.meta.hot)

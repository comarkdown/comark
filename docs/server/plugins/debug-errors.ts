// TEMPORARY: diagnosing the "Function Invocation Failed" 500 on the docs/ecosystem preview.
// Nitro's default fatal-error handling logs only the H3Error wrapper, not the underlying cause.
// Remove this file once the real error is identified.
export default defineNitroPlugin((nitro) => {
  nitro.hooks.hook('error', async (error, context) => {
    console.error('[debug-errors] path:', context?.event?.path)
    console.error('[debug-errors] message:', error?.message)
    console.error('[debug-errors] stack:', error?.stack)
    console.error('[debug-errors] cause:', (error as any)?.cause)
  })
})

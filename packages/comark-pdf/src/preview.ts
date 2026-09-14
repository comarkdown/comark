/**
 * Browser-only PDF preview entry point.
 *
 * Renders PDF bytes using jasy and mounts them into a target element as an
 * `<iframe>` backed by a Blob URL. This is a pure in-browser approach — no
 * headless browser or server required. jasy runs fully in-process.
 *
 * @example
 * ```typescript
 * import { mount } from '@comark/pdf/preview'
 * import { renderPdf } from '@comark/pdf'
 *
 * const bytes = await renderPdf(markdown)
 * const handle = mount(document.getElementById('preview')!, bytes)
 *
 * // Later, when done:
 * handle.revoke()
 * ```
 */

export interface PdfMountHandle {
  /** Revoke the Blob URL to free browser memory. Call when the preview is removed. */
  revoke(): void
}

/**
 * Mount pre-rendered PDF bytes into a target element as an embedded iframe.
 *
 * @param target - The DOM element to render into. Its contents are replaced.
 * @param bytes - PDF bytes, e.g. from `renderPdf(markdown)`.
 * @returns A handle with a `revoke()` method to release the Blob URL.
 */
export const mount = (target: Element, bytes: Uint8Array): PdfMountHandle => {
  const blobPart = new Uint8Array(bytes)
  const blob = new Blob([blobPart], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)

  const iframe = document.createElement('iframe')
  iframe.src = url
  iframe.style.cssText = 'width:100%;height:100%;border:none;display:block'

  target.innerHTML = ''
  target.appendChild(iframe)

  return {
    revoke() {
      URL.revokeObjectURL(url)
    },
  }
}

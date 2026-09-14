import { renderFor } from 'comark/plugins/binding'

/** Structural marker interpreted by the Markdown renderer. */
export const For = Object.assign(() => null, { __comarkRender: renderFor })

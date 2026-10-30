// The playground keeps its Markdown in the URL hash, like the TypeScript playground, so a link carries the input and
// nothing is stored on a server. The text is deflated and base64url-encoded to keep links short.
const PREFIX = '#code/'

async function bytes(stream: ReadableStream<Uint8Array>): Promise<Uint8Array> {
  return new Uint8Array(await new Response(stream).arrayBuffer())
}

export async function encodeShareHash(markdown: string): Promise<string> {
  const deflated = await bytes(new Blob([markdown]).stream().pipeThrough(new CompressionStream('deflate-raw')))
  let binary = ''
  for (const byte of deflated) binary += String.fromCharCode(byte)
  return PREFIX + btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

/** The Markdown in a share hash, or `undefined` for a hash that isn't one. Throws when the hash is cut off or mangled. */
export async function decodeShareHash(hash: string): Promise<string | undefined> {
  if (!hash.startsWith(PREFIX)) return undefined
  const binary = atob(hash.slice(PREFIX.length).replace(/-/g, '+').replace(/_/g, '/'))
  const deflated = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  const inflated = await bytes(new Blob([deflated]).stream().pipeThrough(new DecompressionStream('deflate-raw')))
  return new TextDecoder().decode(inflated)
}

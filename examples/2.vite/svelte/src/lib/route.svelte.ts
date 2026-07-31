/** Reactive current hash route path, e.g. `/`, `/post/hello-world`, `/syntax`, `/live`. */
const read = () => (typeof location === 'undefined' ? '/' : location.hash.slice(1) || '/')

let path = $state(read())

if (typeof window !== 'undefined') {
  window.addEventListener('hashchange', () => {
    path = read()
  })
}

export const route = {
  get path() {
    return path
  },
}

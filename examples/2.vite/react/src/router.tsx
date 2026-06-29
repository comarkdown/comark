import { useEffect, useState, type AnchorHTMLAttributes } from 'react'

/** Current hash route path, e.g. `/`, `/post/hello-world`, `/syntax`, `/live`. */
export function useHashRoute(): string {
  const read = () => window.location.hash.slice(1) || '/'
  const [path, setPath] = useState(read)

  useEffect(() => {
    const onChange = () => setPath(read())
    window.addEventListener('hashchange', onChange)
    return () => window.removeEventListener('hashchange', onChange)
  }, [])

  return path
}

/** Anchor that navigates via the hash router. */
export function Link({ to, children, ...rest }: { to: string } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={`#${to}`}
      {...rest}
    >
      {children}
    </a>
  )
}

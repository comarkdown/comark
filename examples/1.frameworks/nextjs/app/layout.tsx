import type { Metadata } from 'next'
import Link from 'next/link'
import '@comark/react/streamdown.css'
import './globals.css'

export const metadata: Metadata = {
  title: 'Comark Blog',
  description: 'A blog built with Next.js and Comark.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <header>
          <nav className="flex items-center justify-between">
            <Link href="/">Comark Blog</Link>
            <Link
              href="/streaming"
              className="text-sm font-normal text-neutral-500 dark:text-neutral-400"
            >
              Streaming demo
            </Link>
          </nav>
        </header>
        <main>{children}</main>
        <footer>
          <p>
            Built with <a href="https://nextjs.org">Next.js</a>
            {' + '}
            <a href="https://github.com/comarkdown/comark">Comark</a>
          </p>
        </footer>
      </body>
    </html>
  )
}

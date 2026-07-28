import { Link, useHashRoute } from './router'
import Home from './pages/Home'
import BlogPost from './pages/BlogPost'
import Syntax from './pages/Syntax'
import Live from './pages/Live'

const navLink =
  'text-sm text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-300 no-underline'

function Page({ path }: { path: string }) {
  if (path === '/') return <Home />
  if (path === '/syntax') return <Syntax />
  if (path === '/live') return <Live />
  if (path.startsWith('/post/')) return <BlogPost slug={path.slice('/post/'.length)} />
  return <p>Not found</p>
}

export default function App() {
  const path = useHashRoute()

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-neutral-200 dark:border-neutral-800">
        <nav className="max-w-2xl mx-auto px-6 py-4 flex items-center gap-6">
          <Link
            to="/"
            className="text-lg font-semibold text-neutral-900 dark:text-white no-underline"
          >
            Comark Blog
          </Link>
          <Link
            to="/syntax"
            className={navLink}
          >
            Syntax
          </Link>
          <Link
            to="/live"
            className={navLink}
          >
            Live
          </Link>
        </nav>
      </header>
      <main className="max-w-2xl mx-auto px-6 py-8 flex-1 w-full prose">
        <Page path={path} />
      </main>
      <footer className="border-t border-neutral-200 dark:border-neutral-800 text-center text-sm text-neutral-500 dark:text-neutral-400 py-6">
        Built with{' '}
        <a
          href="https://react.dev"
          className="text-neutral-700 dark:text-neutral-300 underline"
        >
          React
        </a>{' '}
        +{' '}
        <a
          href="https://comark.dev"
          className="text-neutral-700 dark:text-neutral-300 underline"
        >
          Comark
        </a>
      </footer>
    </div>
  )
}

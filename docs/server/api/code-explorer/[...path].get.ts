import { parse } from 'comark'
import type { ComarkTree } from 'comark'
import highlight from 'comark/plugins/highlight'
import astroLanguage from '@shikijs/langs/astro'

const EXT_TO_LANG: Record<string, string> = {
  ts: 'typescript',
  tsx: 'tsx',
  js: 'javascript',
  jsx: 'jsx',
  mjs: 'javascript',
  cjs: 'javascript',
  vue: 'vue',
  json: 'json',
  md: 'comark',
  mdx: 'comark',
  css: 'css',
  scss: 'css',
  html: 'html',
  yaml: 'yaml',
  yml: 'yaml',
  toml: 'toml',
  sh: 'bash',
  bash: 'bash',
  zsh: 'bash',
  astro: 'astro',
  svelte: 'svelte',
  xml: 'xml',
  sql: 'sql',
  graphql: 'graphql',
  dockerfile: 'dockerfile',
  txt: 'text',
}

const EXCLUDED_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'webp', 'avif',
  'woff', 'woff2', 'ttf', 'eot',
  'mp3', 'mp4', 'webm', 'ogg',
  'zip', 'tar', 'gz', 'br',
])

const EXCLUDED_FILES = new Set([
  'pnpm-lock.yaml', 'package-lock.json', 'yarn.lock', 'bun.lockb',
  '.DS_Store', 'Thumbs.db',
])

const EXCLUDED_DIRS = ['.git', 'node_modules', 'dist', '.output', '.nuxt', '.next']

function getExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || ''
}

function shouldExclude(relativePath: string): boolean {
  const filename = relativePath.split('/').pop() || ''
  const ext = getExtension(filename)

  if (EXCLUDED_EXTENSIONS.has(ext)) return true
  if (EXCLUDED_FILES.has(filename)) return true
  return EXCLUDED_DIRS.some(dir => relativePath.includes(`/${dir}/`) || relativePath.startsWith(`${dir}/`))
}

interface CodeExplorerTreeItem {
  filename: string
  path: string
  children?: CodeExplorerTreeItem[]
}

function buildTree(filePaths: string[]): CodeExplorerTreeItem[] {
  const root: CodeExplorerTreeItem[] = []

  for (const filePath of filePaths.sort()) {
    const parts = filePath.split('/')
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]!
      const isFile = i === parts.length - 1
      const currentPath = parts.slice(0, i + 1).join('/')

      if (isFile) {
        current.push({
          filename: part,
          path: currentPath,
        })
      }
      else {
        let dir = current.find(item => item.children && item.path === currentPath)
        if (!dir) {
          dir = {
            filename: part,
            path: currentPath,
            children: [],
          }
          current.push(dir)
        }
        current = dir.children!
      }
    }
  }

  sortTree(root)
  return root
}

function sortTree(items: CodeExplorerTreeItem[]) {
  items.sort((a, b) => {
    const aIsDir = !!a.children
    const bIsDir = !!b.children
    if (aIsDir !== bIsDir) return aIsDir ? -1 : 1
    return a.filename.localeCompare(b.filename)
  })
  for (const item of items) {
    if (item.children) sortTree(item.children)
  }
}

interface JsDelivrFile {
  name: string
  hash: string
  size: number
}

interface JsDelivrResponse {
  files: JsDelivrFile[]
}

const CONCURRENCY = 10

async function processInBatches<T, R>(items: T[], fn: (item: T) => Promise<R>): Promise<R[]> {
  const results: R[] = []
  for (let i = 0; i < items.length; i += CONCURRENCY) {
    const batch = items.slice(i, i + CONCURRENCY)
    results.push(...await Promise.all(batch.map(fn)))
  }
  return results
}

export default defineEventHandler(async (event) => {
  const fullPath = (getRouterParam(event, 'path') || '').replace(/\.json$/, '')
  const segments = fullPath.split('/')

  if (segments.length < 3) {
    throw createError({ statusCode: 400, message: 'Expected: {org}/{repo}[@branch]/{path}' })
  }

  const org = segments[0]!
  const repoSegment = segments[1]!
  let repo: string
  let branch: string

  const atIdx = repoSegment.indexOf('@')
  if (atIdx !== -1) {
    repo = repoSegment.substring(0, atIdx)
    branch = repoSegment.substring(atIdx + 1).replaceAll('~', '/')
  }
  else {
    repo = repoSegment
    branch = 'main'
  }

  const dirPath = segments.slice(2).join('/')
  const encodedBranch = branch.replaceAll('/', '%2F')
  const listing = await $fetch<JsDelivrResponse>(
    `https://data.jsdelivr.com/v1/package/gh/${org}/${repo}@${encodedBranch}/flat`,
  )

  const prefix = `/${dirPath}/`.replaceAll('//', '/')
  const files = listing.files
    .filter(f => f.name.startsWith(prefix))
    .map(f => f.name.slice(prefix.length))
    .filter(relativePath => !shouldExclude(relativePath))
    .sort()

  const highlightPlugin = highlight({
    themes: {
      light: (await import('@shikijs/themes/material-theme-lighter')).default,
      dark: (await import('@shikijs/themes/material-theme-palenight')).default,
    },
    languages: [astroLanguage],
  })

  const fileResults: Record<string, ComarkTree> = {}

  await processInBatches(files, async (relativePath) => {
    const rawUrl = `https://raw.githubusercontent.com/${org}/${repo}/${branch}/${dirPath}/${relativePath}`
    const content = await $fetch<string>(rawUrl, { responseType: 'text' })

    const language = EXT_TO_LANG[getExtension(relativePath)] || 'text'
    const markdown = '~~~' + language + '\n' + content + '\n~~~'
    const tree = await parse(markdown, { plugins: [highlightPlugin] })

    fileResults[relativePath] = tree
  })

  const tree = buildTree(files)

  return { tree, files: fileResults }
})

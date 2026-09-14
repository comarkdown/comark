import { expect, it } from 'vitest'
import { createServer } from 'vite'
import { chromium } from 'playwright'
import { fileURLToPath } from 'node:url'

it('preserves keyed inputs on reorder and item updates, then selects empty', async () => {
  const root = fileURLToPath(new URL('..', import.meta.url))
  const server = await createServer({ configFile: false, root, server: { host: '127.0.0.1', port: 0 } })
  await server.listen()
  const browser = await chromium.launch({ headless: true })
  try {
    const page = await browser.newPage()
    const errors: string[] = []
    page.on('pageerror', (error) => errors.push(error.message))
    const address = server.httpServer!.address() as { port: number }
    await page.goto(`http://127.0.0.1:${address.port}/test/fixtures/for-browser.html`)
    await page.getByRole('textbox', { name: 'Alpha' }).fill('Keep this draft')
    await page.evaluate(() => {
      Object.assign(window, { originalInput: document.querySelector('input') })
      ;(window as any).updatePosts([
        { id: 'b', title: 'Beta' },
        { id: 'a', title: 'Alpha' },
      ])
    })
    await expect.poll(() => page.locator('input').last().getAttribute('aria-label')).toBe('Alpha')
    expect(await page.evaluate(() => document.querySelectorAll('input')[1] === (window as any).originalInput)).toBe(
      true
    )
    expect(await page.getByRole('textbox', { name: 'Alpha' }).inputValue()).toBe('Keep this draft')
    await page.evaluate(() => (window as any).updatePosts([{ id: 'a', title: 'Updated' }]))
    await expect.poll(() => page.locator('input').first().getAttribute('aria-label')).toBe('Updated')
    expect(await page.evaluate(() => document.querySelector('input') === (window as any).originalInput)).toBe(true)
    await page.evaluate(() => (window as any).updatePosts([]))
    await expect.poll(() => page.locator('body').innerText()).toContain('No posts')
    expect(await page.locator('input').count()).toBe(0)
    expect(errors).toEqual([])
  } finally {
    await browser.close()
    await server.close()
  }
}, 30_000)

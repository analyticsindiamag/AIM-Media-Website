import { test, expect } from '@playwright/test'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

test('home has canonical link', async ({ page }) => {
  await page.goto(BASE_URL)
  const canonical = await page.locator('head link[rel="canonical"]').first()
  await expect(canonical).toHaveAttribute('href', `${BASE_URL}/`)
})

test('robots.txt configured with sitemap and disallow admin', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/robots.txt`)
  expect(res.ok()).toBeTruthy()
  const body = await res.text()
  expect(body).toContain('Sitemap:')
  expect(body).toContain('/sitemap.xml')
  expect(body).toMatch(/Disallow:\s*\/admin\//)
})

test('sitemap.xml is served and includes site root', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/sitemap.xml`)
  expect(res.ok()).toBeTruthy()
  const xml = await res.text()
  expect(xml).toContain(BASE_URL)
})

test('rss.xml feeds latest posts', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/rss.xml`)
  expect(res.ok()).toBeTruthy()
  const xml = await res.text()
  expect(xml).toContain('<rss')
  expect(xml).toContain('<channel>')
})

test('admin pages are noindex', async ({ page }) => {
  await page.goto(`${BASE_URL}/admin/login`)
  const robotsMeta = page.locator('head meta[name="robots"]')
  await expect(robotsMeta).toHaveAttribute('content', /noindex/i)
})



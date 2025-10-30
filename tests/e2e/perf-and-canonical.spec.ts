import { test, expect } from '@playwright/test'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

test('categories API has cache headers', async ({ request }) => {
  const res = await request.get(`${BASE_URL}/api/categories`)
  expect(res.ok()).toBeTruthy()
  const cc = res.headers()['cache-control']
  expect(cc).toContain('s-maxage')
})

test('home canonical is absolute and correct', async ({ page }) => {
  await page.goto(BASE_URL)
  const href = await page.getAttribute('head link[rel="canonical"]', 'href')
  expect(href).toBe(`${BASE_URL}/`)
})



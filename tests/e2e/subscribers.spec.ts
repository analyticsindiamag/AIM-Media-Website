import { test, expect } from '@playwright/test'

test('subscribe via API and see in admin list', async ({ page, request }) => {
  const email = `e2e-subscriber-${Date.now()}@example.com`
  const res = await request.post('/api/subscribe', {
    data: { email },
  })
  expect(res.ok()).toBeTruthy()

  await page.goto('/admin/subscribers')
  await expect(page.getByText(email)).toBeVisible()
})



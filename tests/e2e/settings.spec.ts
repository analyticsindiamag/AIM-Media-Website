import { test, expect } from '@playwright/test'

test('update a setting and persist', async ({ page, request }) => {
  const siteName = `AI Tech News - ${Date.now()}`

  // Update via API to avoid UI timing/caching issues
  const res = await request.put('/api/settings', {
    data: {
      siteName,
      logoUrl: '',
      navLinksJson: '',
      footerLinksJson: '',
      subscribeCta: '',
    },
  })
  expect(res.ok()).toBeTruthy()

  await page.goto('/admin/settings')
  await expect(page.getByLabel('Site Name')).toHaveValue(siteName)
})



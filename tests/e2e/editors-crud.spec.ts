import { test, expect } from '@playwright/test'

test('create editor and see it listed', async ({ page }) => {
  const name = `E2E Editor ${Date.now()}`
  const email = `e2e${Date.now()}@example.com`

  await page.goto('/admin/editors')

  await page.getByLabel('Name *').fill(name)
  await page.getByLabel('Email *').fill(email)
  await page.getByLabel('Bio').fill('Created by Playwright')
  await page.getByRole('button', { name: 'Create Editor' }).click()

  await expect(page.getByText(name)).toBeVisible()
  await expect(page.getByText(email)).toBeVisible()
})



import { test, expect } from '@playwright/test'

test('create category and see it listed', async ({ page }) => {
  const name = `E2E Cat ${Date.now()}`
  const slug = `e2e-cat-${Date.now()}`

  await page.goto('/admin/categories')

  await page.getByLabel('Name *').fill(name)
  await page.getByLabel('Slug *').fill(slug)
  await page.getByLabel('Description').fill('Created by Playwright')
  await page.getByRole('button', { name: 'Create Category' }).click()

  await expect(page.getByText(name)).toBeVisible()
  await expect(page.getByText(`Slug: ${slug}`)).toBeVisible()
})



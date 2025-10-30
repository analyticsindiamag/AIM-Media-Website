import { test, expect } from '@playwright/test'

test.describe('Admin navigation', () => {
  test('menu links render and highlight active route', async ({ page }) => {
    await page.goto('/admin')

    const links = [
      { href: '/admin', label: 'Dashboard', heading: 'Dashboard' },
      { href: '/admin/articles', label: 'Articles', heading: 'Articles' },
      { href: '/admin/categories', label: 'Categories', heading: 'Categories' },
      { href: '/admin/editors', label: 'Editors', heading: 'Editors / Authors' },
      { href: '/admin/import', label: 'Import CSV', heading: 'Import from WordPress' },
      { href: '/admin/subscribers', label: 'Subscribers', heading: 'Subscribers' },
      { href: '/admin/settings', label: 'Settings', heading: 'Site Settings' },
    ]

    for (const { href, label, heading } of links) {
      await page.getByRole('link', { name: label }).click()
      await expect(page).toHaveURL(href)
      await expect(page.getByRole('heading', { name: heading, exact: true })).toBeVisible()

      // Active link should have the active styles (bg-white text-black)
      const activeLink = page.getByRole('link', { name: label })
      await expect(activeLink).toHaveClass(/bg-white/)
      await expect(activeLink).toHaveClass(/text-black/)
    }
  })
})



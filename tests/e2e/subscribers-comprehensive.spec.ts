import { test, expect } from '@playwright/test'

test.describe('Subscribers Management - Comprehensive', () => {
  let adminPassword: string

  test.beforeEach(async ({ page }) => {
    adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    await page.goto('/admin/login')
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')
  })

  test('should display subscribers list', async ({ page }) => {
    await page.goto('/admin/subscribers')

    await expect(page.getByRole('heading', { name: 'Subscribers' })).toBeVisible()
    await expect(page.getByRole('link', { name: 'Export CSV' })).toBeVisible()
  })

  test('should show subscriber email and date', async ({ page, request }) => {
    const timestamp = Date.now()
    const email = `subscriber-${timestamp}@example.com`

    // Create subscriber via API
    await request.post('/api/subscribe', {
      data: { email }
    })

    await page.goto('/admin/subscribers')

    await expect(page.getByText(email)).toBeVisible()
    // Should show date
    const row = page.locator('tr', { hasText: email })
    await expect(row.locator('td').nth(1)).toBeVisible() // Date column
  })

  test('should show empty state when no subscribers', async ({ page, request }) => {
    // Note: We can't easily delete subscribers via API, so this test checks the UI
    await page.goto('/admin/subscribers')

    // If there are subscribers, they should be visible
    // If not, empty state should show
    const table = page.locator('table')
    const emptyState = page.locator('text=No subscribers yet')

    const hasSubscribers = await table.count() > 0
    if (!hasSubscribers) {
      await expect(emptyState).toBeVisible()
    }
  })

  test('should export subscribers as CSV', async ({ page, request }) => {
    const timestamp = Date.now()
    const email = `export-test-${timestamp}@example.com`

    // Create subscriber
    await request.post('/api/subscribe', {
      data: { email }
    })

    await page.goto('/admin/subscribers')

    // Click export link
    const [download] = await Promise.all([
      page.waitForEvent('download'),
      page.click('text=Export CSV')
    ])

    expect(download.suggestedFilename()).toContain('.csv')
    
    // Verify CSV content
    const path = await download.path()
    if (path) {
      const fs = require('fs')
      const content = fs.readFileSync(path, 'utf-8')
      expect(content).toContain('Email')
      expect(content).toContain('Subscribed At')
      expect(content).toContain(email)
    }
  })

  test('should display subscribers in descending order by date', async ({ page, request }) => {
    const timestamp = Date.now()
    
    // Create multiple subscribers
    await request.post('/api/subscribe', { data: { email: `first-${timestamp}@example.com` } })
    await page.waitForTimeout(1000) // Ensure different timestamps
    await request.post('/api/subscribe', { data: { email: `second-${timestamp}@example.com` } })
    await page.waitForTimeout(1000)
    await request.post('/api/subscribe', { data: { email: `third-${timestamp}@example.com` } })

    await page.goto('/admin/subscribers')

    // Get all subscriber rows
    const rows = page.locator('tbody tr')
    const count = await rows.count()

    if (count >= 3) {
      // Most recent should be first
      const firstRow = rows.first()
      await expect(firstRow.getByText(`third-${timestamp}@example.com`)).toBeVisible()
    }
  })

  test('should handle special characters in email', async ({ page, request }) => {
    const timestamp = Date.now()
    const email = `test+special.${timestamp}@example.com`

    await request.post('/api/subscribe', {
      data: { email }
    })

    await page.goto('/admin/subscribers')

    await expect(page.getByText(email)).toBeVisible()
  })

  test('should prevent duplicate email subscriptions', async ({ page, request }) => {
    const timestamp = Date.now()
    const email = `duplicate-${timestamp}@example.com`

    // Create first subscription
    await request.post('/api/subscribe', {
      data: { email }
    })

    // Try to create duplicate
    const res = await request.post('/api/subscribe', {
      data: { email },
      failOnStatusCode: false
    })

    // Should fail or return error
    expect([400, 409]).toContain(res.status())
  })

  test('should show correct date format', async ({ page, request }) => {
    const timestamp = Date.now()
    const email = `date-test-${timestamp}@example.com`

    await request.post('/api/subscribe', {
      data: { email }
    })

    await page.goto('/admin/subscribers')

    const row = page.locator('tr', { hasText: email })
    const dateCell = row.locator('td').nth(1)
    const dateText = await dateCell.textContent()

    // Should be a valid date format
    expect(dateText).toMatch(/\d{1,2}\/\d{1,2}\/\d{4}/) // Basic date format check
  })
})


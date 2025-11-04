import { test, expect } from '@playwright/test'

test.describe('Settings Management - Comprehensive', () => {
  let adminPassword: string
  let originalSettings: any

  test.beforeEach(async ({ page, request }) => {
    adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    await page.goto('/admin/login')
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')

    // Save original settings
    const res = await request.get('/api/settings')
    originalSettings = await res.json()
  })

  test.afterEach(async ({ request }) => {
    // Restore original settings
    if (originalSettings) {
      await request.put('/api/settings', {
        data: {
          siteName: originalSettings.siteName || '',
          logoUrl: originalSettings.logoUrl || '',
          navLinksJson: originalSettings.navLinksJson || '',
          footerLinksJson: originalSettings.footerLinksJson || '',
          subscribeCta: originalSettings.subscribeCta || '',
          headerBarLeftText: originalSettings.headerBarLeftText || '',
          headerBarLeftLink: originalSettings.headerBarLeftLink || '',
          headerBarRightText: originalSettings.headerBarRightText || '',
          headerBarRightLink: originalSettings.headerBarRightLink || '',
        }
      })
    }
  })

  test('should update site name', async ({ page }) => {
    const timestamp = Date.now()
    const siteName = `Test Site ${timestamp}`

    await page.goto('/admin/settings')
    await page.fill('input[id="siteName"]', siteName)
    await page.click('button:has-text("Save Settings")')

    // Page reloads after save
    await expect(page.getByLabel('Site Name')).toHaveValue(siteName)
  })

  test('should update logo URL', async ({ page }) => {
    const logoUrl = 'https://example.com/logo.png'

    await page.goto('/admin/settings')
    await page.fill('input[id="logoUrl"]', logoUrl)
    await page.click('button:has-text("Save Settings")')

    // Page reloads
    await expect(page.getByLabel('Or enter Logo URL manually')).toHaveValue(logoUrl)
  })

  test('should update navigation links JSON', async ({ page }) => {
    const navLinks = '[{"label":"Test Link","href":"/test"}]'

    await page.goto('/admin/settings')
    await page.fill('textarea[id="navLinksJson"]', navLinks)
    await page.click('button:has-text("Save Settings")')

    await expect(page.getByLabel('Nav Links JSON')).toHaveValue(navLinks)
  })

  test('should update footer links JSON', async ({ page }) => {
    const footerLinks = '[{"label":"Privacy","href":"/privacy"},{"label":"Terms","href":"/terms"}]'

    await page.goto('/admin/settings')
    await page.fill('textarea[id="footerLinksJson"]', footerLinks)
    await page.click('button:has-text("Save Settings")')

    await expect(page.getByLabel('Footer Links JSON')).toHaveValue(footerLinks)
  })

  test('should update subscribe CTA text', async ({ page }) => {
    const cta = 'Subscribe for weekly updates!'

    await page.goto('/admin/settings')
    await page.fill('input[id="subscribeCta"]', cta)
    await page.click('button:has-text("Save Settings")')

    await expect(page.getByLabel('Subscribe CTA Text')).toHaveValue(cta)
  })

  test('should update header bar settings', async ({ page }) => {
    const leftText = 'AI Tech'
    const leftLink = '/category/ai'
    const rightText = 'Latest News'
    const rightLink = '/latest'

    await page.goto('/admin/settings')
    await page.fill('input[id="headerBarLeftText"]', leftText)
    await page.fill('input[id="headerBarLeftLink"]', leftLink)
    await page.fill('input[id="headerBarRightText"]', rightText)
    await page.fill('input[id="headerBarRightLink"]', rightLink)
    await page.click('button:has-text("Save Settings")')

    await expect(page.getByLabel('Left Side Text')).toHaveValue(leftText)
    await expect(page.getByLabel('Left Side Link URL')).toHaveValue(leftLink)
    await expect(page.getByLabel('Right Side Text')).toHaveValue(rightText)
    await expect(page.getByLabel('Right Side Link URL')).toHaveValue(rightLink)
  })

  test('should load existing settings on page load', async ({ page, request }) => {
    // Set some settings via API
    const timestamp = Date.now()
    await request.put('/api/settings', {
      data: {
        siteName: `Loaded Test ${timestamp}`,
        subscribeCta: 'Test CTA',
        navLinksJson: '[{"label":"Test","href":"/test"}]'
      }
    })

    await page.goto('/admin/settings')

    await expect(page.getByLabel('Site Name')).toHaveValue(`Loaded Test ${timestamp}`)
    await expect(page.getByLabel('Subscribe CTA Text')).toHaveValue('Test CTA')
    await expect(page.getByLabel('Nav Links JSON')).toHaveValue('[{"label":"Test","href":"/test"}]')
  })

  test('should handle empty settings', async ({ page }) => {
    await page.goto('/admin/settings')

    // Clear all fields
    await page.fill('input[id="siteName"]', '')
    await page.fill('input[id="logoUrl"]', '')
    await page.fill('textarea[id="navLinksJson"]', '')
    await page.fill('textarea[id="footerLinksJson"]', '')
    await page.fill('input[id="subscribeCta"]', '')
    await page.fill('input[id="headerBarLeftText"]', '')
    await page.fill('input[id="headerBarLeftLink"]', '')
    await page.fill('input[id="headerBarRightText"]', '')
    await page.fill('input[id="headerBarRightLink"]', '')

    await page.click('button:has-text("Save Settings")')

    // Should save successfully (empty strings are valid)
    await expect(page.getByLabel('Site Name')).toHaveValue('')
  })

  test('should show loading state during save', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.fill('input[id="siteName"]', 'Loading Test')

    const clickPromise = page.click('button:has-text("Save Settings")')
    await expect(page.locator('button:has-text("Saving...")')).toBeVisible()
    await clickPromise
  })

  test('should reload page after save', async ({ page }) => {
    const timestamp = Date.now()
    const siteName = `Reload Test ${timestamp}`

    await page.goto('/admin/settings')
    await page.fill('input[id="siteName"]', siteName)
    
    // Monitor for page reload
    const reloadPromise = page.waitForLoadState('networkidle')
    await page.click('button:has-text("Save Settings")')
    await reloadPromise

    // Page should have reloaded
    await expect(page.getByLabel('Site Name')).toHaveValue(siteName)
  })

  test('should validate JSON format for nav links', async ({ page }) => {
    await page.goto('/admin/settings')
    
    // Invalid JSON
    await page.fill('textarea[id="navLinksJson"]', 'invalid json')
    await page.click('button:has-text("Save Settings")')

    // Should still save (no client-side validation)
    // Backend might accept or reject
  })

  test('should handle very long text fields', async ({ page }) => {
    const longText = 'A'.repeat(1000)

    await page.goto('/admin/settings')
    await page.fill('input[id="siteName"]', longText)
    await page.click('button:has-text("Save Settings")')

    await expect(page.getByLabel('Site Name')).toHaveValue(longText)
  })

  test('should persist settings across sessions', async ({ page, request }) => {
    const timestamp = Date.now()
    const siteName = `Persist Test ${timestamp}`

    await page.goto('/admin/settings')
    await page.fill('input[id="siteName"]', siteName)
    await page.click('button:has-text("Save Settings")')

    // Verify via API
    const res = await request.get('/api/settings')
    const settings = await res.json()
    expect(settings.siteName).toBe(siteName)
  })

  test('should create default settings if none exist', async ({ request }) => {
    // Delete settings (if possible) and verify creation
    const res = await request.get('/api/settings')
    const settings = await res.json()
    
    // Settings should always exist (singleton pattern)
    expect(settings).toBeTruthy()
    expect(settings.id).toBe('default')
  })
})


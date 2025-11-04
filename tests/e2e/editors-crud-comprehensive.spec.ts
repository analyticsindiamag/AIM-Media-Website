import { test, expect } from '@playwright/test'

test.describe('Editors CRUD - Comprehensive', () => {
  let adminPassword: string

  test.beforeEach(async ({ page }) => {
    adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    await page.goto('/admin/login')
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')
  })

  test('should create editor with all fields', async ({ page }) => {
    const timestamp = Date.now()
    const name = `Full Editor ${timestamp}`
    const email = `full-editor-${timestamp}@example.com`
    const bio = 'This is a comprehensive test editor bio'

    await page.goto('/admin/editors')

    await page.fill('input[id="name"]', name)
    await page.fill('input[id="email"]', email)
    await page.fill('textarea[id="bio"]', bio)
    await page.click('button:has-text("Create Editor")')

    await expect(page.getByText(name)).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
    await expect(page.getByText(bio)).toBeVisible()
  })

  test('should create editor without bio and avatar', async ({ page }) => {
    const timestamp = Date.now()
    const name = `Minimal Editor ${timestamp}`
    const email = `minimal-${timestamp}@example.com`

    await page.goto('/admin/editors')

    await page.fill('input[id="name"]', name)
    await page.fill('input[id="email"]', email)
    await page.click('button:has-text("Create Editor")')

    await expect(page.getByText(name)).toBeVisible()
    await expect(page.getByText(email)).toBeVisible()
  })

  test('should validate email format', async ({ page }) => {
    await page.goto('/admin/editors')

    await page.fill('input[id="name"]', 'Test Editor')
    await page.fill('input[id="email"]', 'invalid-email')
    await page.click('button:has-text("Create Editor")')

    // HTML5 email validation should trigger
    const emailInput = page.locator('input[id="email"]')
    const validity = await emailInput.evaluate((el: HTMLInputElement) => el.validity.valid)
    expect(validity).toBe(false)
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/editors')

    await page.click('button:has-text("Create Editor")')

    const nameInput = page.locator('input[id="name"]')
    await expect(nameInput).toBeFocused()
  })

  test('should reset form after successful creation', async ({ page }) => {
    const timestamp = Date.now()
    const name = `Reset Editor ${timestamp}`
    const email = `reset-${timestamp}@example.com`

    await page.goto('/admin/editors')

    await page.fill('input[id="name"]', name)
    await page.fill('input[id="email"]', email)
    await page.click('button:has-text("Create Editor")')

    // Form should be reset
    await expect(page.locator('input[id="name"]')).toHaveValue('')
    await expect(page.locator('input[id="email"]')).toHaveValue('')
  })

  test('should delete editor', async ({ page, request }) => {
    const timestamp = Date.now()
    
    // Create editor via API
    const edRes = await request.post('/api/editors', {
      data: {
        name: `Delete Editor ${timestamp}`,
        email: `delete-${timestamp}@example.com`,
        bio: 'To be deleted'
      }
    })
    const { editor } = await edRes.json()

    await page.goto('/admin/editors')

    // Delete editor
    page.on('dialog', dialog => dialog.accept())
    const editorCard = page.locator(`text=Delete Editor ${timestamp}`).locator('..')
    await editorCard.locator('button:has-text("Delete")').click()

    await expect(page.getByText(`Delete Editor ${timestamp}`)).not.toBeVisible()
  })

  test('should prevent duplicate emails', async ({ page, request }) => {
    const timestamp = Date.now()
    const email = `duplicate-${timestamp}@example.com`

    // Create first editor
    await request.post('/api/editors', {
      data: {
        name: `First Editor ${timestamp}`,
        email,
        bio: 'First'
      }
    })

    // Try to create duplicate
    await page.goto('/admin/editors')
    await page.fill('input[id="name"]', `Second Editor ${timestamp}`)
    await page.fill('input[id="email"]', email)
    await page.click('button:has-text("Create Editor")')

    // Should show error
    await expect(page.locator('text=/.*error.*|.*failed.*/i')).toBeVisible({ timeout: 5000 })
  })

  test('should generate unique slug automatically', async ({ page, request }) => {
    const timestamp = Date.now()
    const name = 'Duplicate Name'

    // Create first editor with this name
    await request.post('/api/editors', {
      data: {
        name,
        email: `first-${timestamp}@example.com`
      }
    })

    // Create second editor with same name
    await page.goto('/admin/editors')
    await page.fill('input[id="name"]', name)
    await page.fill('input[id="email"]', `second-${timestamp}@example.com`)
    await page.click('button:has-text("Create Editor")')

    // Should succeed with auto-generated unique slug
    await expect(page.getByText(name)).toBeVisible({ timeout: 10000 })
  })

  test('should show empty state when no editors', async ({ page, request }) => {
    // Delete all editors (but first check if any articles reference them)
    const edsRes = await request.get('/api/editors')
    const editors = await edsRes.json()
    
    // Note: This might fail if editors have articles - that's expected
    for (const ed of editors) {
      try {
        await request.delete(`/api/editors?id=${ed.id}`)
      } catch (e) {
        // Ignore errors for editors with articles
      }
    }

    await page.goto('/admin/editors')

    await expect(page.getByText('No editors yet')).toBeVisible()
  })

  test('should display editors in alphabetical order', async ({ page, request }) => {
    // Create editors in random order
    await request.post('/api/editors', {
      data: { name: 'Zebra Editor', email: `zebra-${Date.now()}@example.com` }
    })
    await request.post('/api/editors', {
      data: { name: 'Alpha Editor', email: `alpha-${Date.now()}@example.com` }
    })
    await request.post('/api/editors', {
      data: { name: 'Beta Editor', email: `beta-${Date.now()}@example.com` }
    })

    await page.goto('/admin/editors')

    const editorTexts = await page.locator('.border').allTextContents()
    const editorNames = editorTexts.map(text => {
      const match = text.match(/^([^\n]+)/)
      return match ? match[1] : ''
    }).filter(Boolean)

    // Should be alphabetically ordered
    expect(editorNames[0]).toContain('Alpha')
    expect(editorNames[1]).toContain('Beta')
    expect(editorNames[editorNames.length - 1]).toContain('Zebra')
  })

  test('should update article dropdown when editor created', async ({ page }) => {
    const timestamp = Date.now()
    const name = `Dropdown Editor ${timestamp}`
    const email = `dropdown-${timestamp}@example.com`

    // Create editor
    await page.goto('/admin/editors')
    await page.fill('input[id="name"]', name)
    await page.fill('input[id="email"]', email)
    await page.click('button:has-text("Create Editor")')

    // Check it appears in article form
    await page.goto('/admin/articles/new')
    await page.click('button:has-text("Select author")')
    
    await expect(page.getByText(name)).toBeVisible()
  })

  test('should handle special characters in name', async ({ page }) => {
    const timestamp = Date.now()
    const name = `Special Editor & Co. ${timestamp}`
    const email = `special-${timestamp}@example.com`

    await page.goto('/admin/editors')

    await page.fill('input[id="name"]', name)
    await page.fill('input[id="email"]', email)
    await page.click('button:has-text("Create Editor")')

    await expect(page.getByText(name)).toBeVisible()
  })

  test('should show loading state during creation', async ({ page }) => {
    const timestamp = Date.now()
    const name = `Loading Editor ${timestamp}`
    const email = `loading-${timestamp}@example.com`

    await page.goto('/admin/editors')

    await page.fill('input[id="name"]', name)
    await page.fill('input[id="email"]', email)
    
    const clickPromise = page.click('button:has-text("Create Editor")')
    await expect(page.locator('button:has-text("Creating...")')).toBeVisible()
    await clickPromise
  })
})


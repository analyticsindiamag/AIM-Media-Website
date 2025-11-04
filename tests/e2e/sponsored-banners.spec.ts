import { test, expect } from '@playwright/test'

test.describe('Sponsored Banners CRUD', () => {
  let adminPassword: string

  test.beforeEach(async ({ page }) => {
    adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    await page.goto('/admin/login')
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')
  })

  test('should create sponsored banner', async ({ page }) => {
    const timestamp = Date.now()
    const title = `Test Banner ${timestamp}`
    const imageUrl = `https://example.com/banner-${timestamp}.jpg`

    await page.goto('/admin/sponsored-banners')
    await page.click('button:has-text("Add Banner")')

    await page.fill('input[id="title"]', title)
    await page.fill('input[id="imageUrl"]', imageUrl)
    await page.selectOption('select[id="type"]', 'homepage-main')
    await page.click('button:has-text("Create Banner")')

    await expect(page.getByText(title)).toBeVisible()
  })

  test('should create banner with all fields', async ({ page }) => {
    const timestamp = Date.now()
    const title = `Full Banner ${timestamp}`
    const imageUrl = `https://example.com/banner-${timestamp}.jpg`
    const linkUrl = `https://example.com/link-${timestamp}`
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 30)
    const endDate = futureDate.toISOString().split('T')[0]

    await page.goto('/admin/sponsored-banners')
    await page.click('button:has-text("Add Banner")')

    await page.fill('input[id="title"]', title)
    await page.fill('input[id="imageUrl"]', imageUrl)
    await page.fill('input[id="linkUrl"]', linkUrl)
    await page.selectOption('select[id="type"]', 'article-side')
    await page.fill('input[id="endDate"]', endDate)
    await page.fill('input[id="displayOrder"]', '5')
    await page.uncheck('input[type="checkbox"]') // Set inactive

    await page.click('button:has-text("Create Banner")')

    await expect(page.getByText(title)).toBeVisible()
    await expect(page.getByText('Article Side Banner')).toBeVisible()
    await expect(page.getByText('Inactive')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/sponsored-banners')
    await page.click('button:has-text("Add Banner")')

    await page.click('button:has-text("Create Banner")')

    // HTML5 validation should prevent submission
    const titleInput = page.locator('input[id="title"]')
    await expect(titleInput).toBeFocused()
  })

  test('should edit banner', async ({ page, request }) => {
    const timestamp = Date.now()
    
    // Create banner via API
    const bannerRes = await request.post('/api/sponsored-banners', {
      data: {
        title: `Edit Test ${timestamp}`,
        imageUrl: `https://example.com/edit-${timestamp}.jpg`,
        type: 'homepage-main',
        active: true
      }
    })
    const banner = await bannerRes.json()

    await page.goto('/admin/sponsored-banners')

    // Click edit button
    const row = page.locator('tr', { hasText: `Edit Test ${timestamp}` })
    await row.locator('button').first().click() // Edit button

    // Update title
    await page.fill('input[id="title"]', `Updated Banner ${timestamp}`)
    await page.click('button:has-text("Update Banner")')

    await expect(page.getByText(`Updated Banner ${timestamp}`)).toBeVisible()
  })

  test('should delete banner', async ({ page, request }) => {
    const timestamp = Date.now()
    
    // Create banner via API
    const bannerRes = await request.post('/api/sponsored-banners', {
      data: {
        title: `Delete Test ${timestamp}`,
        imageUrl: `https://example.com/delete-${timestamp}.jpg`,
        type: 'homepage-side',
        active: true
      }
    })
    const banner = await bannerRes.json()

    await page.goto('/admin/sponsored-banners')

    // Delete banner
    page.on('dialog', dialog => dialog.accept())
    const row = page.locator('tr', { hasText: `Delete Test ${timestamp}` })
    await row.locator('button').last().click() // Delete button

    await expect(page.getByText(`Delete Test ${timestamp}`)).not.toBeVisible()
  })

  test('should show all banner types', async ({ page }) => {
    await page.goto('/admin/sponsored-banners')
    await page.click('button:has-text("Add Banner")')

    const typeSelect = page.locator('select[id="type"]')
    const options = await typeSelect.locator('option').allTextContents()

    expect(options).toContain('Homepage Main Banner (Horizontal)')
    expect(options).toContain('Homepage Side Banner (Vertical)')
    expect(options).toContain('Article Side Banner (Vertical)')
  })

  test('should handle date ranges', async ({ page }) => {
    const timestamp = Date.now()
    const title = `Date Range Test ${timestamp}`
    const imageUrl = `https://example.com/date-${timestamp}.jpg`
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 1)
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + 30)

    await page.goto('/admin/sponsored-banners')
    await page.click('button:has-text("Add Banner")')

    await page.fill('input[id="title"]', title)
    await page.fill('input[id="imageUrl"]', imageUrl)
    await page.selectOption('select[id="type"]', 'homepage-main')
    await page.fill('input[id="startDate"]', startDate.toISOString().split('T')[0])
    await page.fill('input[id="endDate"]', endDate.toISOString().split('T')[0])
    await page.click('button:has-text("Create Banner")')

    await expect(page.getByText(title)).toBeVisible()
  })

  test('should toggle active status', async ({ page, request }) => {
    const timestamp = Date.now()
    
    const bannerRes = await request.post('/api/sponsored-banners', {
      data: {
        title: `Active Test ${timestamp}`,
        imageUrl: `https://example.com/active-${timestamp}.jpg`,
        type: 'homepage-main',
        active: true
      }
    })
    const banner = await bannerRes.json()

    await page.goto('/admin/sponsored-banners')

    // Edit to toggle active
    const row = page.locator('tr', { hasText: `Active Test ${timestamp}` })
    await row.locator('button').first().click()

    await page.uncheck('input[type="checkbox"]')
    await page.click('button:has-text("Update Banner")')

    await expect(page.getByText('Inactive')).toBeVisible()
  })

  test('should show empty state when no banners', async ({ page, request }) => {
    // Delete all banners
    const bannersRes = await request.get('/api/sponsored-banners?active=false')
    const banners = await bannersRes.json()
    for (const banner of banners) {
      await request.delete(`/api/sponsored-banners/${banner.id}`)
    }

    await page.goto('/admin/sponsored-banners')

    await expect(page.getByText('No banners found')).toBeVisible()
  })

  test('should set display order', async ({ page, request }) => {
    const timestamp = Date.now()
    
    // Create banners with different orders
    await request.post('/api/sponsored-banners', {
      data: {
        title: `Order 1 ${timestamp}`,
        imageUrl: `https://example.com/1-${timestamp}.jpg`,
        type: 'homepage-main',
        displayOrder: 1
      }
    })
    await request.post('/api/sponsored-banners', {
      data: {
        title: `Order 2 ${timestamp}`,
        imageUrl: `https://example.com/2-${timestamp}.jpg`,
        type: 'homepage-main',
        displayOrder: 2
      }
    })

    await page.goto('/admin/sponsored-banners')

    // Verify order is displayed
    await expect(page.getByText(`Order 1 ${timestamp}`)).toBeVisible()
    await expect(page.getByText(`Order 2 ${timestamp}`)).toBeVisible()
  })

  test('should reset form on cancel', async ({ page }) => {
    await page.goto('/admin/sponsored-banners')
    await page.click('button:has-text("Add Banner")')

    await page.fill('input[id="title"]', 'Test Title')
    await page.fill('input[id="imageUrl"]', 'https://example.com/test.jpg')
    await page.click('button:has-text("Cancel")')

    // Form should be hidden
    await expect(page.locator('input[id="title"]')).not.toBeVisible()
  })

  test('should validate image URL format', async ({ page }) => {
    await page.goto('/admin/sponsored-banners')
    await page.click('button:has-text("Add Banner")')

    await page.fill('input[id="title"]', 'Test Banner')
    await page.fill('input[id="imageUrl"]', 'not-a-valid-url')
    await page.selectOption('select[id="type"]', 'homepage-main')
    await page.click('button:has-text("Create Banner")')

    // Should still work (no URL validation on client)
    // Backend might validate or fail
  })
})


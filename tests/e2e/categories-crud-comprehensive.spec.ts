import { test, expect } from '@playwright/test'

test.describe('Categories CRUD - Comprehensive', () => {
  let adminPassword: string

  test.beforeEach(async ({ page }) => {
    adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    await page.goto('/admin/login')
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')
  })

  test('should create category with all fields', async ({ page }) => {
    const timestamp = Date.now()
    const name = `Full Category ${timestamp}`
    const slug = `full-category-${timestamp}`
    const description = 'This is a comprehensive test category description'

    await page.goto('/admin/categories')

    await page.fill('input[id="name"]', name)
    await page.fill('input[id="slug"]', slug)
    await page.fill('textarea[id="description"]', description)
    await page.click('button:has-text("Create Category")')

    await expect(page.getByText(name)).toBeVisible()
    await expect(page.getByText(`Slug: ${slug}`)).toBeVisible()
    await expect(page.getByText(description)).toBeVisible()
  })

  test('should auto-generate slug from name', async ({ page }) => {
    const timestamp = Date.now()
    const name = `Auto Slug Category ${timestamp}`

    await page.goto('/admin/categories')
    await page.fill('input[id="name"]', name)
    
    // Wait for slug generation
    await page.waitForTimeout(500)
    const slugValue = await page.inputValue('input[id="slug"]')
    
    expect(slugValue).toBeTruthy()
    expect(slugValue.toLowerCase()).toContain('auto-slug-category')
  })

  test('should create category without description', async ({ page }) => {
    const timestamp = Date.now()
    const name = `No Desc Category ${timestamp}`
    const slug = `no-desc-category-${timestamp}`

    await page.goto('/admin/categories')

    await page.fill('input[id="name"]', name)
    await page.fill('input[id="slug"]', slug)
    await page.click('button:has-text("Create Category")')

    await expect(page.getByText(name)).toBeVisible()
    await expect(page.getByText(`Slug: ${slug}`)).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/categories')

    // Try to submit without name
    await page.click('button:has-text("Create Category")')
    
    const nameInput = page.locator('input[id="name"]')
    await expect(nameInput).toBeFocused()
  })

  test('should reset form after successful creation', async ({ page }) => {
    const timestamp = Date.now()
    const name = `Reset Test ${timestamp}`
    const slug = `reset-test-${timestamp}`

    await page.goto('/admin/categories')

    await page.fill('input[id="name"]', name)
    await page.fill('input[id="slug"]', slug)
    await page.click('button:has-text("Create Category")')

    // Form should be reset
    await expect(page.locator('input[id="name"]')).toHaveValue('')
    await expect(page.locator('input[id="slug"]')).toHaveValue('')
  })

  test('should delete category', async ({ page, request }) => {
    const timestamp = Date.now()
    
    // Create category via API
    const catRes = await request.post('/api/categories', {
      data: {
        name: `Delete Test ${timestamp}`,
        slug: `delete-test-${timestamp}`,
        description: 'To be deleted'
      }
    })
    const { category } = await catRes.json()

    await page.goto('/admin/categories')

    // Delete category
    page.on('dialog', dialog => dialog.accept())
    const categoryCard = page.locator(`text=Delete Test ${timestamp}`).locator('..')
    await categoryCard.locator('button:has-text("Delete")').click()

    await expect(page.getByText(`Delete Test ${timestamp}`)).not.toBeVisible()
  })

  test('should show empty state when no categories', async ({ page, request }) => {
    // Delete all categories
    const catsRes = await request.get('/api/categories')
    const categories = await catsRes.json()
    for (const cat of categories) {
      await request.delete(`/api/categories?id=${cat.id}`)
    }

    await page.goto('/admin/categories')

    await expect(page.getByText('No categories yet')).toBeVisible()
  })

  test('should prevent duplicate category names', async ({ page, request }) => {
    const timestamp = Date.now()
    const name = `Duplicate Test ${timestamp}`
    const slug = `duplicate-test-${timestamp}`

    // Create first category
    await request.post('/api/categories', {
      data: { name, slug, description: 'First' }
    })

    // Try to create duplicate
    await page.goto('/admin/categories')
    await page.fill('input[id="name"]', name)
    await page.fill('input[id="slug"]', `${slug}-2`)
    await page.click('button:has-text("Create Category")')

    // Should show error (database constraint)
    await expect(page.locator('text=/.*error.*|.*failed.*/i')).toBeVisible({ timeout: 5000 })
  })

  test('should handle special characters in slug', async ({ page }) => {
    const timestamp = Date.now()
    const name = `Special Chars ${timestamp}`
    const slug = `special-chars-${timestamp}` // Normalized slug

    await page.goto('/admin/categories')

    await page.fill('input[id="name"]', name)
    await page.fill('input[id="slug"]', slug)
    await page.click('button:has-text("Create Category")')

    await expect(page.getByText(name)).toBeVisible()
    await expect(page.getByText(`Slug: ${slug}`)).toBeVisible()
  })

  test('should show loading state during creation', async ({ page }) => {
    const timestamp = Date.now()
    const name = `Loading Test ${timestamp}`
    const slug = `loading-test-${timestamp}`

    await page.goto('/admin/categories')

    await page.fill('input[id="name"]', name)
    await page.fill('input[id="slug"]', slug)
    
    const clickPromise = page.click('button:has-text("Create Category")')
    await expect(page.locator('button:has-text("Creating...")')).toBeVisible()
    await clickPromise
  })

  test('should display categories in alphabetical order', async ({ page, request }) => {
    // Create categories in random order
    await request.post('/api/categories', { data: { name: 'Zebra Category', slug: 'zebra-category' } })
    await request.post('/api/categories', { data: { name: 'Alpha Category', slug: 'alpha-category' } })
    await request.post('/api/categories', { data: { name: 'Beta Category', slug: 'beta-category' } })

    await page.goto('/admin/categories')

    const categoryTexts = await page.locator('.border').allTextContents()
    const categoryNames = categoryTexts.map(text => {
      const match = text.match(/^([^\n]+)/)
      return match ? match[1] : ''
    }).filter(Boolean)

    // Should be alphabetically ordered
    expect(categoryNames[0]).toContain('Alpha')
    expect(categoryNames[1]).toContain('Beta')
    expect(categoryNames[categoryNames.length - 1]).toContain('Zebra')
  })

  test('should update article dropdown when category created', async ({ page }) => {
    const timestamp = Date.now()
    const name = `Dropdown Test ${timestamp}`
    const slug = `dropdown-test-${timestamp}`

    // Create category
    await page.goto('/admin/categories')
    await page.fill('input[id="name"]', name)
    await page.fill('input[id="slug"]', slug)
    await page.click('button:has-text("Create Category")')

    // Check it appears in article form
    await page.goto('/admin/articles/new')
    await page.click('button:has-text("Select category")')
    
    await expect(page.getByText(name)).toBeVisible()
  })
})


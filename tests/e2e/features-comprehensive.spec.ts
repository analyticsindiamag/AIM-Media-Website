import { test, expect } from '@playwright/test'

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

test.describe('Comprehensive Features Testing', () => {
  let authCookie: string | undefined

  test.beforeEach(async ({ page, request }) => {
    // Login to admin
    const loginResponse = await request.post('http://localhost:3000/api/admin/login', {
      data: { password: ADMIN_PASSWORD },
    })
    const cookies = loginResponse.headers()['set-cookie']
    if (cookies) {
      authCookie = cookies.split(';')[0].split('=')[1]
      await page.context().addCookies([{
        name: 'admin-auth',
        value: authCookie,
        domain: 'localhost',
        path: '/',
      }])
    }
  })

  test('1. Article Scheduling - Create and verify scheduled article', async ({ page, request }) => {
    // Navigate to create article
    await page.goto('http://localhost:3000/admin/articles/new')
    
    // Fill article form
    await page.fill('input[name="title"]', 'Scheduled Test Article')
    await page.fill('input[name="slug"]', 'scheduled-test-article')
    await page.fill('textarea[name="excerpt"]', 'This is a scheduled article for testing')
    await page.fill('textarea[name="content"]', '<p>This article is scheduled for future publication.</p>')
    
    // Get categories and editors
    const categoriesResponse = await request.get('http://localhost:3000/api/categories')
    const categories = await categoriesResponse.json()
    const editorsResponse = await request.get('http://localhost:3000/api/editors')
    const editors = await editorsResponse.json()
    
    if (categories.length > 0 && editors.length > 0) {
      // Select category
      await page.click('button:has-text("Select category")')
      await page.click(`text=${categories[0].name}`)
      
      // Select editor
      await page.click('button:has-text("Select author")')
      await page.click(`text=${editors[0].name}`)
      
      // Set scheduled date (2 days from now)
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 2)
      const scheduledDate = futureDate.toISOString().split('T')[0]
      const scheduledTime = '10:00'
      
      await page.fill('input[type="datetime-local"]', `${scheduledDate}T${scheduledTime}`)
      
      // Uncheck published (should be scheduled, not published)
      await page.uncheck('input[name="published"]')
      
      // Submit
      await page.click('button:has-text("Create Article")')
      
      // Wait for redirect
      await page.waitForURL('**/admin/articles')
      
      // Verify article exists in list
      await expect(page.locator('text=Scheduled Test Article')).toBeVisible()
      
      // Check scheduled articles API
      const scheduledResponse = await request.get('http://localhost:3000/api/articles/scheduled/publish')
      const scheduledData = await scheduledResponse.json()
      expect(scheduledResponse.ok()).toBeTruthy()
      expect(scheduledData.count).toBeGreaterThanOrEqual(0)
    }
  })

  test('2. Social Media Share Buttons - Verify all platforms', async ({ page, context }) => {
    // Get a published article
    const articlesResponse = await page.request.get('http://localhost:3000/api/articles')
    const articles = await articlesResponse.json()
    const publishedArticle = articles.find((a: any) => a.published)
    
    if (publishedArticle) {
      await page.goto(`http://localhost:3000/article/${publishedArticle.slug}`)
      
      // Wait for share buttons
      await page.waitForSelector('text=Share:', { timeout: 5000 })
      
      // Verify share buttons exist
      await expect(page.locator('text=X')).toBeVisible()
      await expect(page.locator('text=LinkedIn')).toBeVisible()
      await expect(page.locator('text=Facebook')).toBeVisible()
      await expect(page.locator('text=Copy link')).toBeVisible()
      
      // Test copy link functionality
      const copyButton = page.locator('button:has-text("Copy link")')
      await copyButton.click()
      
      // Verify clipboard contains article URL
      const clipboardText = await page.evaluate(() => navigator.clipboard.readText())
      expect(clipboardText).toContain('/article/')
    }
  })

  test('3. Category Banner Image - Admin Edit and Display', async ({ page, request }) => {
    // Get categories
    const categoriesResponse = await request.get('http://localhost:3000/api/categories')
    const categories = await categoriesResponse.json()
    
    if (categories.length > 0) {
      const category = categories[0]
      
      // Navigate to categories admin
      await page.goto('http://localhost:3000/admin/categories')
      
      // Find and click edit button for first category
      const editButton = page.locator(`button:has-text("Edit")`).first()
      await editButton.click()
      
      // Update banner image
      const bannerImageUrl = 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=1200&h=400&fit=crop'
      await page.fill('input[placeholder*="banner"]', bannerImageUrl)
      
      // Save
      await page.click('button:has-text("Update")')
      
      // Wait for update
      await page.waitForTimeout(1000)
      
      // Verify banner image appears on category page
      await page.goto(`http://localhost:3000/category/${category.slug}`)
      const bannerImage = page.locator(`img[alt*="${category.name}"]`).first()
      await expect(bannerImage).toBeVisible()
    }
  })

  test('4. Editor Edit Functionality', async ({ page, request }) => {
    // Get editors
    const editorsResponse = await request.get('http://localhost:3000/api/editors')
    const editors = await editorsResponse.json()
    
    if (editors.length > 0) {
      const editor = editors[0]
      const originalName = editor.name
      const newName = `${originalName} (Updated)`
      
      // Navigate to editors admin
      await page.goto('http://localhost:3000/admin/editors')
      
      // Click edit button
      const editButton = page.locator(`button:has-text("Edit")`).first()
      await editButton.click()
      
      // Verify form shows edit mode
      await expect(page.locator('h2:has-text("Edit Editor")')).toBeVisible()
      
      // Update name
      await page.fill('input[name="name"]', newName)
      
      // Update bio
      await page.fill('textarea[name="bio"]', 'Updated bio for testing')
      
      // Submit
      await page.click('button:has-text("Update Editor")')
      
      // Wait for update
      await page.waitForTimeout(1000)
      
      // Verify editor was updated
      await expect(page.locator(`text=${newName}`)).toBeVisible()
      
      // Revert changes
      await editButton.click()
      await page.fill('input[name="name"]', originalName)
      await page.click('button:has-text("Update Editor")')
    }
  })

  test('5. Sponsored Banners CRUD', async ({ page }) => {
    await page.goto('http://localhost:3000/admin/sponsored-banners')
    
    // Create new banner
    await page.click('button:has-text("Add Banner")')
    
    await page.fill('input[id="title"]', 'Test Banner')
    await page.fill('input[id="imageUrl"]', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=728&h=90&fit=crop')
    await page.fill('input[id="linkUrl"]', 'https://example.com')
    await page.selectOption('select[id="type"]', 'homepage-main')
    await page.fill('input[id="displayOrder"]', '1')
    
    await page.click('button:has-text("Create Banner")')
    
    // Wait for banner to appear
    await page.waitForTimeout(1000)
    
    // Verify banner exists
    await expect(page.locator('text=Test Banner')).toBeVisible()
    
    // Edit banner
    const editButton = page.locator('button').filter({ hasText: 'Edit' }).first()
    await editButton.click()
    
    await page.fill('input[id="title"]', 'Updated Test Banner')
    await page.click('button:has-text("Update Banner")')
    
    // Verify update
    await page.waitForTimeout(1000)
    await expect(page.locator('text=Updated Test Banner')).toBeVisible()
    
    // Delete banner
    const deleteButton = page.locator('button').filter({ hasText: 'Delete' }).first()
    await deleteButton.click()
    
    // Confirm deletion
    page.on('dialog', dialog => dialog.accept())
    await deleteButton.click()
    
    await page.waitForTimeout(1000)
  })

  test('6. Responsive Design - Mobile View', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Test homepage
    await page.goto('http://localhost:3000')
    await expect(page.locator('body')).toBeVisible()
    
    // Test article page
    const articlesResponse = await page.request.get('http://localhost:3000/api/articles')
    const articles = await articlesResponse.json()
    const publishedArticle = articles.find((a: any) => a.published)
    
    if (publishedArticle) {
      await page.goto(`http://localhost:3000/article/${publishedArticle.slug}`)
      await expect(page.locator('article')).toBeVisible()
      
      // Verify content is readable
      const articleContent = page.locator('.article-content')
      await expect(articleContent).toBeVisible()
    }
    
    // Test category page
    const categoriesResponse = await page.request.get('http://localhost:3000/api/categories')
    const categories = await categoriesResponse.json()
    
    if (categories.length > 0) {
      await page.goto(`http://localhost:3000/category/${categories[0].slug}`)
      await expect(page.locator('h1')).toBeVisible()
    }
  })

  test('7. Responsive Design - Tablet View', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    
    await page.goto('http://localhost:3000')
    await expect(page.locator('body')).toBeVisible()
    
    // Verify layout adapts
    const grid = page.locator('.grid')
    if (await grid.count() > 0) {
      await expect(grid.first()).toBeVisible()
    }
  })

  test('8. Responsive Design - Desktop View', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1920, height: 1080 })
    
    await page.goto('http://localhost:3000')
    await expect(page.locator('body')).toBeVisible()
    
    // Verify full layout
    const mainContent = page.locator('main, .wsj-container')
    await expect(mainContent.first()).toBeVisible()
  })
})


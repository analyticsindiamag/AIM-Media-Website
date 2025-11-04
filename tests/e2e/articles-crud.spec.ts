import { test, expect } from '@playwright/test'

test.describe('Articles CRUD', () => {
  let adminPassword: string
  let categoryId: string
  let editorId: string

  test.beforeEach(async ({ page, request }) => {
    adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    // Login
    await page.goto('/admin/login')
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')

    // Setup: Create category and editor if they don't exist
    const categoriesRes = await request.get('/api/categories')
    const categories = await categoriesRes.json()
    if (categories.length === 0) {
      const catRes = await request.post('/api/categories', {
        data: { name: 'Test Category', slug: 'test-category', description: 'Test' }
      })
      const cat = await catRes.json()
      categoryId = cat.category.id
    } else {
      categoryId = categories[0].id
    }

    const editorsRes = await request.get('/api/editors')
    const editors = await editorsRes.json()
    if (editors.length === 0) {
      const edRes = await request.post('/api/editors', {
        data: { name: 'Test Editor', email: `test-${Date.now()}@example.com`, bio: 'Test' }
      })
      const ed = await edRes.json()
      editorId = ed.editor.id
    } else {
      editorId = editors[0].id
    }
  })

  test('should create a new article', async ({ page }) => {
    const timestamp = Date.now()
    const title = `Test Article ${timestamp}`
    const slug = `test-article-${timestamp}`

    await page.goto('/admin/articles/new')

    // Fill form
    await page.fill('input[id="title"]', title)
    await page.fill('input[id="slug"]', slug)
    await page.fill('textarea[id="excerpt"]', 'This is a test excerpt')
    
    // Get category and editor names
    const catRes = await request.get('/api/categories')
    const categories = await catRes.json()
    const edRes = await request.get('/api/editors')
    const editors = await edRes.json()
    const categoryName = categories.find((c: any) => c.id === categoryId)?.name || categories[0]?.name
    const editorName = editors.find((e: any) => e.id === editorId)?.name || editors[0]?.name
    
    // Select category (Radix UI Select)
    await page.click('button:has-text("Select category")')
    await page.click(`text=${categoryName}`)
    
    // Select editor (Radix UI Select)
    await page.click('button:has-text("Select author")')
    await page.click(`text=${editorName}`)
    
    await page.fill('div[contenteditable="true"]', '<p>This is test content</p>')

    // Save as draft
    await page.click('button:has-text("Save as Draft")')
    
    await expect(page).toHaveURL('/admin/articles')
    await expect(page.getByText(title)).toBeVisible()
  })

  test('should auto-generate slug from title', async ({ page }) => {
    const timestamp = Date.now()
    const title = `Auto Slug Test ${timestamp}`

    await page.goto('/admin/articles/new')
    await page.fill('input[id="title"]', title)
    
    // Wait for slug to auto-generate
    await page.waitForTimeout(500)
    const slugValue = await page.inputValue('input[id="slug"]')
    expect(slugValue).toBeTruthy()
    expect(slugValue.toLowerCase()).toContain('auto-slug-test')
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/admin/articles/new')
    
    // Try to submit without filling required fields
    await page.click('button:has-text("Save as Draft")')
    
    // HTML5 validation should prevent submission
    const titleInput = page.locator('input[id="title"]')
    await expect(titleInput).toBeFocused()
  })

  test('should edit an existing article', async ({ page, request }) => {
    // Create article via API
    const timestamp = Date.now()
    const articleRes = await request.post('/api/articles', {
      data: {
        title: `Edit Test ${timestamp}`,
        slug: `edit-test-${timestamp}`,
        content: '<p>Original content</p>',
        categoryId,
        editorId,
        published: false
      }
    })
    const { article } = await articleRes.json()

    await page.goto(`/admin/articles/${article.id}`)

    // Edit title
    await page.fill('input[id="title"]', `Updated Title ${timestamp}`)
    await page.click('button:has-text("Save as Draft")')

    await expect(page).toHaveURL('/admin/articles')
    await expect(page.getByText(`Updated Title ${timestamp}`)).toBeVisible()
  })

  test('should delete an article', async ({ page, request }) => {
    // Create article via API
    const timestamp = Date.now()
    const articleRes = await request.post('/api/articles', {
      data: {
        title: `Delete Test ${timestamp}`,
        slug: `delete-test-${timestamp}`,
        content: '<p>Content</p>',
        categoryId,
        editorId,
        published: false
      }
    })
    const { article } = await articleRes.json()

    await page.goto(`/admin/articles/${article.id}`)

    // Delete article
    page.on('dialog', dialog => dialog.accept())
    await page.click('button:has-text("Delete")')

    await expect(page).toHaveURL('/admin/articles')
    await expect(page.getByText(`Delete Test ${timestamp}`)).not.toBeVisible()
  })

  test('should publish an article', async ({ page, request }) => {
    const timestamp = Date.now()
    const title = `Publish Test ${timestamp}`

    // Get category and editor names
    const catRes = await request.get('/api/categories')
    const categories = await catRes.json()
    const edRes = await request.get('/api/editors')
    const editors = await edRes.json()
    const categoryName = categories.find((c: any) => c.id === categoryId)?.name || categories[0]?.name
    const editorName = editors.find((e: any) => e.id === editorId)?.name || editors[0]?.name

    await page.goto('/admin/articles/new')

    await page.fill('input[id="title"]', title)
    await page.fill('input[id="slug"]', `publish-test-${timestamp}`)
    await page.fill('textarea[id="excerpt"]', 'Test excerpt')
    
    // Select category
    await page.click('button:has-text("Select category")')
    await page.click(`text=${categoryName}`)
    
    // Select editor
    await page.click('button:has-text("Select author")')
    await page.click(`text=${editorName}`)
    
    await page.fill('div[contenteditable="true"]', '<p>Published content</p>')
    await page.check('input[id="published"]')

    await page.click('button:has-text("Publish")')

    await expect(page).toHaveURL('/admin/articles')
    const row = page.locator('tr', { hasText: title })
    await expect(row.locator('text=Published')).toBeVisible()
  })

  test('should schedule an article for later', async ({ page, request }) => {
    const timestamp = Date.now()
    const title = `Scheduled Test ${timestamp}`

    // Get category and editor names
    const catRes = await request.get('/api/categories')
    const categories = await catRes.json()
    const edRes = await request.get('/api/editors')
    const editors = await edRes.json()
    const categoryName = categories.find((c: any) => c.id === categoryId)?.name || categories[0]?.name
    const editorName = editors.find((e: any) => e.id === editorId)?.name || editors[0]?.name

    await page.goto('/admin/articles/new')

    await page.fill('input[id="title"]', title)
    await page.fill('input[id="slug"]', `scheduled-test-${timestamp}`)
    await page.fill('textarea[id="excerpt"]', 'Test excerpt')
    
    // Select category
    await page.click('button:has-text("Select category")')
    await page.click(`text=${categoryName}`)
    
    // Select editor
    await page.click('button:has-text("Select author")')
    await page.click(`text=${editorName}`)
    
    await page.fill('div[contenteditable="true"]', '<p>Scheduled content</p>')
    
    // Set future date
    const futureDate = new Date()
    futureDate.setDate(futureDate.getDate() + 1)
    const dateString = futureDate.toISOString().slice(0, 16)
    await page.fill('input[id="scheduledAt"]', dateString)

    await page.click('button:has-text("Schedule")')

    await expect(page).toHaveURL('/admin/articles')
    // Article should be draft initially
    const row = page.locator('tr', { hasText: title })
    await expect(row.locator('text=Draft')).toBeVisible()
  })

  test('should set article as featured', async ({ page, request }) => {
    const timestamp = Date.now()
    
    // Create article via API
    const articleRes = await request.post('/api/articles', {
      data: {
        title: `Featured Test ${timestamp}`,
        slug: `featured-test-${timestamp}`,
        content: '<p>Content</p>',
        categoryId,
        editorId,
        published: true
      }
    })
    const { article } = await articleRes.json()

    await page.goto('/admin/articles')

    // Set as featured
    await page.click(`tr:has-text("Featured Test ${timestamp}") >> button:has-text("Set Featured")`)
    
    await expect(page.locator(`tr:has-text("Featured Test ${timestamp}") >> text=Featured`)).toBeVisible()
  })

  test('should show article in list after creation', async ({ page, request }) => {
    const timestamp = Date.now()
    const title = `List Test ${timestamp}`

    // Get category and editor names
    const catRes = await request.get('/api/categories')
    const categories = await catRes.json()
    const edRes = await request.get('/api/editors')
    const editors = await edRes.json()
    const categoryName = categories.find((c: any) => c.id === categoryId)?.name || categories[0]?.name
    const editorName = editors.find((e: any) => e.id === editorId)?.name || editors[0]?.name

    await page.goto('/admin/articles/new')

    await page.fill('input[id="title"]', title)
    await page.fill('input[id="slug"]', `list-test-${timestamp}`)
    await page.fill('textarea[id="excerpt"]', 'Test excerpt')
    
    // Select category
    await page.click('button:has-text("Select category")')
    await page.click(`text=${categoryName}`)
    
    // Select editor
    await page.click('button:has-text("Select author")')
    await page.click(`text=${editorName}`)
    
    await page.fill('div[contenteditable="true"]', '<p>Content</p>')

    await page.click('button:has-text("Save as Draft")')

    await expect(page).toHaveURL('/admin/articles')
    await expect(page.getByText(title)).toBeVisible()
    await expect(page.locator('tr', { hasText: title }).locator('text=Draft')).toBeVisible()
  })

  test('should prevent duplicate slugs', async ({ page, request }) => {
    const timestamp = Date.now()
    const slug = `duplicate-slug-${timestamp}`

    // Get category and editor names
    const catRes = await request.get('/api/categories')
    const categories = await catRes.json()
    const edRes = await request.get('/api/editors')
    const editors = await edRes.json()
    const categoryName = categories.find((c: any) => c.id === categoryId)?.name || categories[0]?.name
    const editorName = editors.find((e: any) => e.id === editorId)?.name || editors[0]?.name

    // Create first article
    await request.post('/api/articles', {
      data: {
        title: `First Article ${timestamp}`,
        slug,
        content: '<p>Content</p>',
        categoryId,
        editorId,
        published: false
      }
    })

    // Try to create second article with same slug
    await page.goto('/admin/articles/new')
    await page.fill('input[id="title"]', `Second Article ${timestamp}`)
    await page.fill('input[id="slug"]', slug)
    await page.fill('textarea[id="excerpt"]', 'Test excerpt')
    
    // Select category
    await page.click('button:has-text("Select category")')
    await page.click(`text=${categoryName}`)
    
    // Select editor
    await page.click('button:has-text("Select author")')
    await page.click(`text=${editorName}`)
    
    await page.fill('div[contenteditable="true"]', '<p>Content</p>')

    await page.click('button:has-text("Save as Draft")')

    // Should show error
    await expect(page.locator('text=/.*error.*|.*failed.*/i')).toBeVisible({ timeout: 5000 })
  })

  test('should show empty state when no articles', async ({ page, request }) => {
    // Delete all articles
    const articlesRes = await request.get('/api/articles')
    const articles = await articlesRes.json()
    for (const article of articles) {
      await request.delete(`/api/articles/${article.id}`)
    }

    await page.goto('/admin/articles')

    await expect(page.getByText('No articles yet')).toBeVisible()
    await expect(page.getByRole('link', { name: 'Create Article' })).toBeVisible()
  })

  test('should calculate read time', async ({ page, request }) => {
    const timestamp = Date.now()
    const longContent = '<p>' + 'word '.repeat(500) + '</p>' // ~500 words = ~2.5 minutes

    const articleRes = await request.post('/api/articles', {
      data: {
        title: `Read Time Test ${timestamp}`,
        slug: `read-time-test-${timestamp}`,
        content: longContent,
        categoryId,
        editorId,
        published: false
      }
    })
    const { article } = await articleRes.json()

    // Read time should be calculated (at least 2 minutes)
    expect(article.readTime).toBeGreaterThanOrEqual(2)
  })

  test('should update SEO fields', async ({ page, request }) => {
    const timestamp = Date.now()
    const articleRes = await request.post('/api/articles', {
      data: {
        title: `SEO Test ${timestamp}`,
        slug: `seo-test-${timestamp}`,
        content: '<p>Content</p>',
        categoryId,
        editorId,
        published: false,
        metaTitle: 'Custom Meta Title',
        metaDescription: 'Custom Meta Description'
      }
    })
    const { article } = await articleRes.json()

    await page.goto(`/admin/articles/${article.id}`)

    const metaTitle = await page.inputValue('input[id="metaTitle"]')
    const metaDescription = await page.inputValue('textarea[id="metaDescription"]')

    expect(metaTitle).toBe('Custom Meta Title')
    expect(metaDescription).toBe('Custom Meta Description')
  })

  test('should view article on frontend', async ({ page, request }) => {
    const timestamp = Date.now()
    const articleRes = await request.post('/api/articles', {
      data: {
        title: `Frontend Test ${timestamp}`,
        slug: `frontend-test-${timestamp}`,
        content: '<p>Frontend content</p>',
        categoryId,
        editorId,
        published: true
      }
    })
    const { article } = await articleRes.json()

    await page.goto('/admin/articles')
    const row = page.locator('tr', { hasText: `Frontend Test ${timestamp}` })
    const viewLink = row.locator('a:has-text("View")')
    
    // Open in new tab
    const [newPage] = await Promise.all([
      page.context().waitForEvent('page'),
      viewLink.click({ modifiers: ['Meta'] })
    ])

    await expect(newPage.getByText(`Frontend Test ${timestamp}`)).toBeVisible()
  })
})


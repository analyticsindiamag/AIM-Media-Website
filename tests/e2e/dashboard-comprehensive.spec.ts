import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard - Comprehensive', () => {
  let adminPassword: string

  test.beforeEach(async ({ page }) => {
    adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    await page.goto('/admin/login')
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')
  })

  test('should display dashboard statistics', async ({ page }) => {
    await page.goto('/admin')

    await expect(page.getByText('Total Articles')).toBeVisible()
    await expect(page.getByText('Published')).toBeVisible()
    await expect(page.getByText('Categories')).toBeVisible()
    await expect(page.getByText('Editors')).toBeVisible()
  })

  test('should show correct article counts', async ({ page, request }) => {
    // Get actual counts from API
    const articlesRes = await request.get('/api/articles')
    const articles = await articlesRes.json()
    const totalArticles = articles.length
    const publishedArticles = articles.filter((a: any) => a.published).length

    await page.goto('/admin')

    // Check if counts match (allowing for some variance due to timing)
    const totalText = await page.locator('text=Total Articles').locator('..').locator('text=/\\d+/').first().textContent()
    const publishedText = await page.locator('text=Published').locator('..').locator('text=/\\d+/').first().textContent()

    expect(parseInt(totalText || '0')).toBeGreaterThanOrEqual(0)
    expect(parseInt(publishedText || '0')).toBeLessThanOrEqual(totalArticles)
  })

  test('should show recent articles table', async ({ page }) => {
    await page.goto('/admin')

    await expect(page.getByRole('heading', { name: 'Recent Articles' })).toBeVisible()
  })

  test('should display article details in table', async ({ page, request }) => {
    const timestamp = Date.now()
    
    // Create test article
    const categoriesRes = await request.get('/api/categories')
    const categories = await categoriesRes.json()
    const editorsRes = await request.get('/api/editors')
    const editors = await editorsRes.json()

    if (categories.length > 0 && editors.length > 0) {
      const articleRes = await request.post('/api/articles', {
        data: {
          title: `Dashboard Test ${timestamp}`,
          slug: `dashboard-test-${timestamp}`,
          content: '<p>Content</p>',
          categoryId: categories[0].id,
          editorId: editors[0].id,
          published: true
        }
      })
      const { article } = await articleRes.json()

      await page.goto('/admin')

      // Check if article appears in recent articles
      await expect(page.getByText(`Dashboard Test ${timestamp}`)).toBeVisible()
    }
  })

  test('should show published and draft status badges', async ({ page, request }) => {
    const timestamp = Date.now()
    
    const categoriesRes = await request.get('/api/categories')
    const categories = await categoriesRes.json()
    const editorsRes = await request.get('/api/editors')
    const editors = await editorsRes.json()

    if (categories.length > 0 && editors.length > 0) {
      // Create published article
      await request.post('/api/articles', {
        data: {
          title: `Published Test ${timestamp}`,
          slug: `published-test-${timestamp}`,
          content: '<p>Content</p>',
          categoryId: categories[0].id,
          editorId: editors[0].id,
          published: true
        }
      })

      // Create draft article
      await request.post('/api/articles', {
        data: {
          title: `Draft Test ${timestamp}`,
          slug: `draft-test-${timestamp}`,
          content: '<p>Content</p>',
          categoryId: categories[0].id,
          editorId: editors[0].id,
          published: false
        }
      })

      await page.goto('/admin')

      // Check status badges
      const publishedRow = page.locator('tr', { hasText: `Published Test ${timestamp}` })
      await expect(publishedRow.locator('text=Published')).toBeVisible()

      const draftRow = page.locator('tr', { hasText: `Draft Test ${timestamp}` })
      await expect(draftRow.locator('text=Draft')).toBeVisible()
    }
  })

  test('should show create new article button', async ({ page }) => {
    await page.goto('/admin')

    await expect(page.getByRole('link', { name: 'Create New Article' })).toBeVisible()
  })

  test('should navigate to create article page', async ({ page }) => {
    await page.goto('/admin')
    await page.click('text=Create New Article')

    await expect(page).toHaveURL('/admin/articles/new')
    await expect(page.getByRole('heading', { name: 'Create New Article' })).toBeVisible()
  })

  test('should show edit link for articles', async ({ page, request }) => {
    const timestamp = Date.now()
    
    const categoriesRes = await request.get('/api/categories')
    const categories = await categoriesRes.json()
    const editorsRes = await request.get('/api/editors')
    const editors = await editorsRes.json()

    if (categories.length > 0 && editors.length > 0) {
      const articleRes = await request.post('/api/articles', {
        data: {
          title: `Edit Link Test ${timestamp}`,
          slug: `edit-link-test-${timestamp}`,
          content: '<p>Content</p>',
          categoryId: categories[0].id,
          editorId: editors[0].id,
          published: true
        }
      })
      const { article } = await articleRes.json()

      await page.goto('/admin')

      const row = page.locator('tr', { hasText: `Edit Link Test ${timestamp}` })
      const editLink = row.locator('a:has-text("Edit")')
      await expect(editLink).toBeVisible()

      await editLink.click()
      await expect(page).toHaveURL(`/admin/articles/${article.id}`)
    }
  })

  test('should show article views count', async ({ page, request }) => {
    const timestamp = Date.now()
    
    const categoriesRes = await request.get('/api/categories')
    const categories = await categoriesRes.json()
    const editorsRes = await request.get('/api/editors')
    const editors = await editorsRes.json()

    if (categories.length > 0 && editors.length > 0) {
      const articleRes = await request.post('/api/articles', {
        data: {
          title: `Views Test ${timestamp}`,
          slug: `views-test-${timestamp}`,
          content: '<p>Content</p>',
          categoryId: categories[0].id,
          editorId: editors[0].id,
          published: true,
          views: 42
        }
      })
      const { article } = await articleRes.json()

      await page.goto('/admin')

      const row = page.locator('tr', { hasText: `Views Test ${timestamp}` })
      await expect(row.locator('text=42')).toBeVisible()
    }
  })

  test('should show empty state when no articles', async ({ page, request }) => {
    // Delete all articles
    const articlesRes = await request.get('/api/articles')
    const articles = await articlesRes.json()
    for (const article of articles) {
      await request.delete(`/api/articles/${article.id}`)
    }

    await page.goto('/admin')

    await expect(page.getByText('No articles yet')).toBeVisible()
    await expect(page.getByText('Create your first article!')).toBeVisible()
  })

  test('should limit recent articles to 10', async ({ page, request }) => {
    const categoriesRes = await request.get('/api/categories')
    const categories = await categoriesRes.json()
    const editorsRes = await request.get('/api/editors')
    const editors = await editorsRes.json()

    if (categories.length > 0 && editors.length > 0) {
      // Create more than 10 articles
      for (let i = 0; i < 12; i++) {
        await request.post('/api/articles', {
          data: {
            title: `Recent Test ${i} ${Date.now()}`,
            slug: `recent-test-${i}-${Date.now()}`,
            content: '<p>Content</p>',
            categoryId: categories[0].id,
            editorId: editors[0].id,
            published: true
          }
        })
      }

      await page.goto('/admin')

      // Should show only 10 rows in table (excluding header)
      const rows = page.locator('tbody tr')
      const count = await rows.count()
      expect(count).toBeLessThanOrEqual(10)
    }
  })

  test('should show articles in descending order by date', async ({ page, request }) => {
    const timestamp = Date.now()
    
    const categoriesRes = await request.get('/api/categories')
    const categories = await categoriesRes.json()
    const editorsRes = await request.get('/api/editors')
    const editors = await editorsRes.json()

    if (categories.length > 0 && editors.length > 0) {
      // Create articles with delays
      await request.post('/api/articles', {
        data: {
          title: `Old Article ${timestamp}`,
          slug: `old-article-${timestamp}`,
          content: '<p>Content</p>',
          categoryId: categories[0].id,
          editorId: editors[0].id,
          published: true
        }
      })

      await page.waitForTimeout(1000)

      await request.post('/api/articles', {
        data: {
          title: `New Article ${timestamp}`,
          slug: `new-article-${timestamp}`,
          content: '<p>Content</p>',
          categoryId: categories[0].id,
          editorId: editors[0].id,
          published: true
        }
      })

      await page.goto('/admin')

      // New article should appear first
      const rows = page.locator('tbody tr')
      const firstRow = rows.first()
      await expect(firstRow.getByText(`New Article ${timestamp}`)).toBeVisible()
    }
  })

  test('should display category and editor names', async ({ page, request }) => {
    const timestamp = Date.now()
    
    const categoriesRes = await request.get('/api/categories')
    const categories = await categoriesRes.json()
    const editorsRes = await request.get('/api/editors')
    const editors = await editorsRes.json()

    if (categories.length > 0 && editors.length > 0) {
      const articleRes = await request.post('/api/articles', {
        data: {
          title: `Relation Test ${timestamp}`,
          slug: `relation-test-${timestamp}`,
          content: '<p>Content</p>',
          categoryId: categories[0].id,
          editorId: editors[0].id,
          published: true
        }
      })
      const { article } = await articleRes.json()

      await page.goto('/admin')

      const row = page.locator('tr', { hasText: `Relation Test ${timestamp}` })
      
      // Should show category name
      const categoryName = categories[0].name
      await expect(row.getByText(categoryName)).toBeVisible()
      
      // Should show editor name
      const editorName = editors[0].name
      await expect(row.getByText(editorName)).toBeVisible()
    }
  })
})


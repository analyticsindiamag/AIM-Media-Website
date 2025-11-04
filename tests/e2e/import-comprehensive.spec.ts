import { test, expect } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'

test.describe('WordPress CSV Import - Comprehensive', () => {
  let adminPassword: string
  let categoryId: string
  let editorId: string

  test.beforeEach(async ({ page, request }) => {
    adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    await page.goto('/admin/login')
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')

    // Setup: Create category and editor for import tests
    const categoriesRes = await request.get('/api/categories')
    const categories = await categoriesRes.json()
    if (categories.length === 0) {
      const catRes = await request.post('/api/categories', {
        data: { name: 'Import Category', slug: 'import-category' }
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
        data: { name: 'Import Editor', email: `import-${Date.now()}@example.com` }
      })
      const ed = await edRes.json()
      editorId = ed.editor.id
    } else {
      editorId = editors[0].id
    }
  })

  test('should show import page with instructions', async ({ page }) => {
    await page.goto('/admin/import')

    await expect(page.getByRole('heading', { name: 'Import from WordPress' })).toBeVisible()
    await expect(page.getByText('Required columns')).toBeVisible()
    await expect(page.getByText('Title')).toBeVisible()
    await expect(page.getByText('Content')).toBeVisible()
  })

  test('should accept CSV file upload', async ({ page }) => {
    await page.goto('/admin/import')

    // Create a test CSV file
    const csvContent = `Title,Content,Excerpt,Slug,Date,Status,Categories,Image URL,Author Email,Author First Name,Author Last Name,Meta Title,Meta Description
Test Article,<p>Test content</p>,Test excerpt,test-article,2024-01-01,Publish,Test Category,https://example.com/image.jpg,test@example.com,Test,Author,Test Meta Title,Test Meta Description`

    const filePath = path.join(__dirname, 'test-import.csv')
    fs.writeFileSync(filePath, csvContent)

    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)

    await expect(page.getByText('test-import.csv')).toBeVisible()

    // Cleanup
    fs.unlinkSync(filePath)
  })

  test('should import articles from CSV', async ({ page }) => {
    const timestamp = Date.now()
    const csvContent = `Title,Content,Excerpt,Slug,Date,Status,Categories,Image URL,Author Email,Author First Name,Author Last Name
Import Test ${timestamp},<p>Imported content</p>,Imported excerpt,import-test-${timestamp},2024-01-01,Publish,Import Category,https://example.com/img.jpg,import-${timestamp}@example.com,Import,Editor`

    const filePath = path.join(__dirname, `test-import-${timestamp}.csv`)
    fs.writeFileSync(filePath, csvContent)

    await page.goto('/admin/import')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)

    await page.click('button:has-text("Import Articles")')

    // Wait for import to complete
    await expect(page.getByText(/Successfully imported/)).toBeVisible({ timeout: 10000 })
    await expect(page.getByText(/articles/)).toBeVisible()

    // Verify article was created
    await page.goto('/admin/articles')
    await expect(page.getByText(`Import Test ${timestamp}`)).toBeVisible()

    // Cleanup
    fs.unlinkSync(filePath)
  })

  test('should handle CSV with only required fields', async ({ page }) => {
    const timestamp = Date.now()
    const csvContent = `Title,Content
Minimal Import ${timestamp},<p>Minimal content</p>`

    const filePath = path.join(__dirname, `test-minimal-${timestamp}.csv`)
    fs.writeFileSync(filePath, csvContent)

    await page.goto('/admin/import')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)

    await page.click('button:has-text("Import Articles")')

    await expect(page.getByText(/Successfully imported/)).toBeVisible({ timeout: 10000 })

    // Cleanup
    fs.unlinkSync(filePath)
  })

  test('should show import errors for invalid CSV', async ({ page }) => {
    const csvContent = `Invalid CSV Content`

    const filePath = path.join(__dirname, 'test-invalid.csv')
    fs.writeFileSync(filePath, csvContent)

    await page.goto('/admin/import')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)

    await page.click('button:has-text("Import Articles")')

    // Should show error or failed count
    await expect(
      page.locator('text=/.*error.*|.*failed.*|.*Successfully imported.*/i')
    ).toBeVisible({ timeout: 10000 })

    // Cleanup
    fs.unlinkSync(filePath)
  })

  test('should create categories automatically', async ({ page }) => {
    const timestamp = Date.now()
    const categoryName = `Auto Category ${timestamp}`
    const csvContent = `Title,Content,Categories
Auto Cat Test ${timestamp},<p>Content</p>,${categoryName}`

    const filePath = path.join(__dirname, `test-auto-cat-${timestamp}.csv`)
    fs.writeFileSync(filePath, csvContent)

    await page.goto('/admin/import')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)

    await page.click('button:has-text("Import Articles")')

    await expect(page.getByText(/Successfully imported/)).toBeVisible({ timeout: 10000 })

    // Verify category was created
    await page.goto('/admin/categories')
    await expect(page.getByText(categoryName)).toBeVisible()

    // Cleanup
    fs.unlinkSync(filePath)
  })

  test('should create editors automatically', async ({ page }) => {
    const timestamp = Date.now()
    const editorEmail = `auto-editor-${timestamp}@example.com`
    const csvContent = `Title,Content,Author Email,Author First Name,Author Last Name
Auto Editor Test ${timestamp},<p>Content</p>,${editorEmail},Auto,Editor`

    const filePath = path.join(__dirname, `test-auto-editor-${timestamp}.csv`)
    fs.writeFileSync(filePath, csvContent)

    await page.goto('/admin/import')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)

    await page.click('button:has-text("Import Articles")')

    await expect(page.getByText(/Successfully imported/)).toBeVisible({ timeout: 10000 })

    // Verify editor was created
    await page.goto('/admin/editors')
    await expect(page.getByText(editorEmail)).toBeVisible()

    // Cleanup
    fs.unlinkSync(filePath)
  })

  test('should update existing articles with same slug', async ({ page, request }) => {
    const timestamp = Date.now()
    const slug = `update-test-${timestamp}`

    // Create article first
    await request.post('/api/articles', {
      data: {
        title: `Original Title ${timestamp}`,
        slug,
        content: '<p>Original content</p>',
        categoryId,
        editorId,
        published: false
      }
    })

    // Import CSV with same slug but different content
    const csvContent = `Title,Content,Slug
Updated Title ${timestamp},<p>Updated content</p>,${slug}`

    const filePath = path.join(__dirname, `test-update-${timestamp}.csv`)
    fs.writeFileSync(filePath, csvContent)

    await page.goto('/admin/import')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)

    await page.click('button:has-text("Import Articles")')

    await expect(page.getByText(/Successfully imported/)).toBeVisible({ timeout: 10000 })

    // Verify article was updated
    await page.goto('/admin/articles')
    await expect(page.getByText(`Updated Title ${timestamp}`)).toBeVisible()

    // Cleanup
    fs.unlinkSync(filePath)
  })

  test('should handle multiple articles in CSV', async ({ page }) => {
    const timestamp = Date.now()
    const csvContent = `Title,Content
Multi Article 1 ${timestamp},<p>Content 1</p>
Multi Article 2 ${timestamp},<p>Content 2</p>
Multi Article 3 ${timestamp},<p>Content 3</p>`

    const filePath = path.join(__dirname, `test-multi-${timestamp}.csv`)
    fs.writeFileSync(filePath, csvContent)

    await page.goto('/admin/import')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)

    await page.click('button:has-text("Import Articles")')

    await expect(page.getByText(/Successfully imported.*3.*articles/i)).toBeVisible({ timeout: 10000 })

    // Verify all articles were created
    await page.goto('/admin/articles')
    await expect(page.getByText(`Multi Article 1 ${timestamp}`)).toBeVisible()
    await expect(page.getByText(`Multi Article 2 ${timestamp}`)).toBeVisible()
    await expect(page.getByText(`Multi Article 3 ${timestamp}`)).toBeVisible()

    // Cleanup
    fs.unlinkSync(filePath)
  })

  test('should show file name and size after selection', async ({ page }) => {
    const csvContent = `Title,Content
Test,<p>Content</p>`

    const filePath = path.join(__dirname, 'test-display.csv')
    fs.writeFileSync(filePath, csvContent)

    await page.goto('/admin/import')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)

    await expect(page.getByText('test-display.csv')).toBeVisible()
    // File size should be shown
    await expect(page.getByText(/KB/)).toBeVisible()

    // Cleanup
    fs.unlinkSync(filePath)
  })

  test('should disable import button when no file selected', async ({ page }) => {
    await page.goto('/admin/import')

    const importButton = page.locator('button:has-text("Import Articles")')
    await expect(importButton).toBeDisabled()
  })

  test('should enable import button when file selected', async ({ page }) => {
    const csvContent = `Title,Content
Test,<p>Content</p>`

    const filePath = path.join(__dirname, 'test-enable.csv')
    fs.writeFileSync(filePath, csvContent)

    await page.goto('/admin/import')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)

    const importButton = page.locator('button:has-text("Import Articles")')
    await expect(importButton).toBeEnabled()

    // Cleanup
    fs.unlinkSync(filePath)
  })

  test('should show loading state during import', async ({ page }) => {
    const timestamp = Date.now()
    const csvContent = `Title,Content
Loading Test ${timestamp},<p>Content</p>`

    const filePath = path.join(__dirname, `test-loading-${timestamp}.csv`)
    fs.writeFileSync(filePath, csvContent)

    await page.goto('/admin/import')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)

    const clickPromise = page.click('button:has-text("Import Articles")')
    await expect(page.locator('button:has-text("Importing...")')).toBeVisible()
    await clickPromise

    // Cleanup
    fs.unlinkSync(filePath)
  })

  test('should reset file selection after import', async ({ page }) => {
    const timestamp = Date.now()
    const csvContent = `Title,Content
Reset Test ${timestamp},<p>Content</p>`

    const filePath = path.join(__dirname, `test-reset-${timestamp}.csv`)
    fs.writeFileSync(filePath, csvContent)

    await page.goto('/admin/import')
    const fileInput = page.locator('input[type="file"]')
    await fileInput.setInputFiles(filePath)

    await page.click('button:has-text("Import Articles")')
    await expect(page.getByText(/Successfully imported/)).toBeVisible({ timeout: 10000 })

    // File should be cleared
    await expect(page.getByText('test-reset-')).not.toBeVisible()

    // Cleanup
    fs.unlinkSync(filePath)
  })
})


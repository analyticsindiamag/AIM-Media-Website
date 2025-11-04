import { test, expect } from '@playwright/test'

test.describe('Admin Authentication', () => {
  test.beforeEach(async ({ page }) => {
    // Clear any existing auth cookies
    await page.context().clearCookies()
  })

  test('should redirect to login when accessing admin without auth', async ({ page }) => {
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('should show error for invalid password', async ({ page }) => {
    await page.goto('/admin/login')
    await page.fill('input[name="password"]', 'wrong-password')
    await page.click('button[type="submit"]')
    
    await expect(page.locator('text=Invalid password')).toBeVisible()
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('should login with correct password', async ({ page }) => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    await page.goto('/admin/login')
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/admin')
    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible()
  })

  test('should redirect to intended page after login', async ({ page }) => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    await page.goto('/admin/articles')
    await expect(page).toHaveURL(/\/admin\/login/)
    
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    
    await expect(page).toHaveURL('/admin/articles')
  })

  test('should logout and redirect to login', async ({ page }) => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    // Login first
    await page.goto('/admin/login')
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    await expect(page).toHaveURL('/admin')
    
    // Logout
    await page.click('text=Logout')
    await expect(page).toHaveURL(/\/admin\/login/)
    
    // Verify can't access admin after logout
    await page.goto('/admin')
    await expect(page).toHaveURL(/\/admin\/login/)
  })

  test('should maintain session across page navigations', async ({ page }) => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    await page.goto('/admin/login')
    await page.fill('input[name="password"]', adminPassword)
    await page.click('button[type="submit"]')
    
    // Navigate to different admin pages
    await page.goto('/admin/articles')
    await expect(page.getByRole('heading', { name: 'Articles' })).toBeVisible()
    
    await page.goto('/admin/categories')
    await expect(page.getByRole('heading', { name: 'Categories' })).toBeVisible()
    
    await page.goto('/admin/settings')
    await expect(page.getByRole('heading', { name: 'Site Settings' })).toBeVisible()
  })

  test('should show loading state during login', async ({ page }) => {
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123'
    
    await page.goto('/admin/login')
    await page.fill('input[name="password"]', adminPassword)
    
    const submitPromise = page.click('button[type="submit"]')
    await expect(page.locator('text=Signing in...')).toBeVisible()
    await submitPromise
  })
})


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  testWordPressConnection,
  fetchWordPressUsers,
  fetchWordPressCategories,
  fetchWordPressPosts,
  fetchWordPressMedia,
  type WordPressConfig,
} from '@/lib/wordpress-api-client'
import {
  mapWordPressUserToEditor,
  mapWordPressCategoryToCategory,
  mapWordPressPostToArticle,
  validateWordPressUser,
  validateWordPressCategory,
  validateWordPressPost,
  toSlug,
} from '@/lib/wordpress-mapper'

interface ImportResult {
  type: 'user' | 'category' | 'article'
  wpId: number
  title: string
  success: boolean
  action: 'created' | 'updated' | 'skipped'
  slug?: string
  errors?: string[]
}

interface ImportSummary {
  users: {
    total: number
    successful: number
    failed: number
    created: number
    updated: number
  }
  categories: {
    total: number
    successful: number
    failed: number
    created: number
    updated: number
  }
  articles: {
    total: number
    successful: number
    failed: number
    created: number
    updated: number
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      wordpressUrl,
      username,
      password,
      importStatus = ['publish', 'future'],
      skipExisting = false,
      testOnly = false,
    } = body

    // Validate input
    if (!wordpressUrl || typeof wordpressUrl !== 'string') {
      return NextResponse.json(
        { error: 'WordPress URL is required' },
        { status: 400 }
      )
    }

    // Normalize WordPress URL
    let baseUrl = wordpressUrl.trim()
    if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
      baseUrl = `https://${baseUrl}`
    }
    
    // Remove trailing slash
    baseUrl = baseUrl.replace(/\/$/, '')
    
    // Extract base URL correctly
    // If URL contains /wp-json/wp/v2 or any /wp/v2, extract just the base domain + /wp-json
    if (baseUrl.includes('/wp-json/wp/v2') || baseUrl.includes('/wp/v2')) {
      // Extract domain: https://example.com or https://example.com:8080
      const domainMatch = baseUrl.match(/^(https?:\/\/[^\/]+)/)
      if (domainMatch) {
        baseUrl = `${domainMatch[1]}/wp-json`
      }
    }
    // If URL contains /wp-json but not /wp/v2, extract up to /wp-json
    else if (baseUrl.includes('/wp-json')) {
      // Extract everything up to and including /wp-json
      const wpJsonMatch = baseUrl.match(/^(https?:\/\/[^\/]+(?:\/[^\/]+)*\/wp-json)/)
      if (wpJsonMatch) {
        baseUrl = wpJsonMatch[1]
      }
    }
    // If no /wp-json, add it
    else {
      baseUrl = `${baseUrl}/wp-json`
    }
    
    console.log('Normalized WordPress URL:', baseUrl)

    const config: WordPressConfig = {
      baseUrl,
      username: username || undefined,
      password: password || undefined,
      timeout: 30000,
    }

    // Test connection
    const connectionTest = await testWordPressConnection(config)
    if (!connectionTest.success) {
      return NextResponse.json(
        { error: `Connection failed: ${connectionTest.message}` },
        { status: 400 }
      )
    }

    // If testOnly is true, just return success
    if (testOnly) {
      return NextResponse.json({
        success: true,
        message: 'Connection successful',
      })
    }

    const results: ImportResult[] = []
    const wpUserToEditorMap = new Map<number, string>() // WordPress user ID -> Editor ID
    const wpCategoryToCategoryMap = new Map<number, string>() // WordPress category ID -> Category ID

    // Step 1: Import Users/Editors
    console.log('Fetching WordPress users...')
    const wpUsers = await fetchWordPressUsers(config)
    console.log(`Found ${wpUsers.length} users`)

    for (const wpUser of wpUsers) {
      const validation = validateWordPressUser(wpUser)
      if (!validation.valid) {
        results.push({
          type: 'user',
          wpId: wpUser.id,
          title: wpUser.name || `User ${wpUser.id}`,
          success: false,
          action: 'skipped',
          errors: validation.errors,
        })
        continue
      }

      try {
        const editorData = mapWordPressUserToEditor(wpUser)

        // Try to find existing editor by email
        let editor = await prisma.editor.findUnique({
          where: { email: editorData.email },
        })

        if (!editor) {
          // Try to find by name
          editor = await prisma.editor.findFirst({
            where: { name: editorData.name },
          })
        }

        if (editor) {
          // Update existing editor
          if (!skipExisting) {
            editor = await prisma.editor.update({
              where: { id: editor.id },
              data: {
                name: editorData.name,
                bio: editorData.bio || null,
                avatar: editorData.avatar || null,
                slug: editorData.slug || editor.slug,
              },
            })
          }
          wpUserToEditorMap.set(wpUser.id, editor.id)
          results.push({
            type: 'user',
            wpId: wpUser.id,
            title: editorData.name,
            success: true,
            action: skipExisting ? 'skipped' : 'updated',
            slug: editor.slug,
          })
        } else {
          // Create new editor
          let finalSlug = editorData.slug
          let counter = 1
          while (await prisma.editor.findFirst({ where: { slug: finalSlug } })) {
            finalSlug = `${editorData.slug}-${counter++}`
          }

          let finalEmail = editorData.email
          if (await prisma.editor.findUnique({ where: { email: finalEmail } })) {
            finalEmail = `${editorData.email.split('@')[0]}-${Date.now()}@${editorData.email.split('@')[1] || 'wordpress-migrated.local'}`
          }

          editor = await prisma.editor.create({
            data: {
              name: editorData.name,
              email: finalEmail,
              slug: finalSlug,
              bio: editorData.bio || null,
              avatar: editorData.avatar || null,
            },
          })

          wpUserToEditorMap.set(wpUser.id, editor.id)
          results.push({
            type: 'user',
            wpId: wpUser.id,
            title: editorData.name,
            success: true,
            action: 'created',
            slug: editor.slug,
          })
        }
      } catch (error) {
        results.push({
          type: 'user',
          wpId: wpUser.id,
          title: wpUser.name || `User ${wpUser.id}`,
          success: false,
          action: 'skipped',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        })
        console.error(`Failed to import user ${wpUser.id}:`, error)
      }
    }

    // Step 2: Import Categories
    console.log('Fetching WordPress categories...')
    const wpCategories = await fetchWordPressCategories(config)
    console.log(`Found ${wpCategories.length} categories`)

    for (const wpCategory of wpCategories) {
      const validation = validateWordPressCategory(wpCategory)
      if (!validation.valid) {
        results.push({
          type: 'category',
          wpId: wpCategory.id,
          title: wpCategory.name || `Category ${wpCategory.id}`,
          success: false,
          action: 'skipped',
          errors: validation.errors,
        })
        continue
      }

      try {
        const categoryData = mapWordPressCategoryToCategory(wpCategory)

        // Try to find existing category by slug
        let category = await prisma.category.findFirst({
          where: { slug: categoryData.slug },
        })

        if (!category) {
          // Try to find by name
          category = await prisma.category.findFirst({
            where: { name: categoryData.name },
          })
        }

        if (category) {
          // Update existing category
          if (!skipExisting) {
            category = await prisma.category.update({
              where: { id: category.id },
              data: {
                name: categoryData.name,
                description: categoryData.description || null,
                slug: categoryData.slug || category.slug,
              },
            })
          }
          wpCategoryToCategoryMap.set(wpCategory.id, category.id)
          results.push({
            type: 'category',
            wpId: wpCategory.id,
            title: categoryData.name,
            success: true,
            action: skipExisting ? 'skipped' : 'updated',
            slug: category.slug,
          })
        } else {
          // Create new category
          let finalSlug = categoryData.slug
          let counter = 1
          while (await prisma.category.findFirst({ where: { slug: finalSlug } })) {
            finalSlug = `${categoryData.slug}-${counter++}`
          }

          category = await prisma.category.create({
            data: {
              name: categoryData.name,
              slug: finalSlug,
              description: categoryData.description || null,
            },
          })

          wpCategoryToCategoryMap.set(wpCategory.id, category.id)
          results.push({
            type: 'category',
            wpId: wpCategory.id,
            title: categoryData.name,
            success: true,
            action: 'created',
            slug: category.slug,
          })
        }
      } catch (error) {
        results.push({
          type: 'category',
          wpId: wpCategory.id,
          title: wpCategory.name || `Category ${wpCategory.id}`,
          success: false,
          action: 'skipped',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        })
        console.error(`Failed to import category ${wpCategory.id}:`, error)
      }
    }

    // Step 3: Import Posts/Articles
    console.log('Fetching WordPress posts...')
    const wpPosts = await fetchWordPressPosts(config, Array.isArray(importStatus) ? importStatus : ['publish'])
    console.log(`Found ${wpPosts.length} posts`)

    for (const wpPost of wpPosts) {
      const validation = validateWordPressPost(wpPost)
      if (!validation.valid) {
        results.push({
          type: 'article',
          wpId: wpPost.id,
          title: wpPost.title?.rendered ? wpPost.title.rendered.replace(/<[^>]*>/g, '') : `Post ${wpPost.id}`,
          success: false,
          action: 'skipped',
          errors: validation.errors,
        })
        continue
      }

      try {
        // Resolve author
        const editorId = wpUserToEditorMap.get(wpPost.author)
        if (!editorId) {
          results.push({
            type: 'article',
            wpId: wpPost.id,
            title: wpPost.title?.rendered ? wpPost.title.rendered.replace(/<[^>]*>/g, '') : `Post ${wpPost.id}`,
            success: false,
            action: 'skipped',
            errors: [`Author with WordPress ID ${wpPost.author} not found`],
          })
          continue
        }

        // Resolve category (use first category)
        const categoryId = wpPost.categories.length > 0
          ? wpCategoryToCategoryMap.get(wpPost.categories[0])
          : null

        if (!categoryId) {
          // Create default category if none exists
          let defaultCategory = await prisma.category.findFirst({
            where: { slug: 'general' },
          })

          if (!defaultCategory) {
            defaultCategory = await prisma.category.create({
              data: {
                name: 'General',
                slug: 'general',
              },
            })
          }

          wpCategoryToCategoryMap.set(0, defaultCategory.id)
        }

        const finalCategoryId = categoryId || wpCategoryToCategoryMap.get(0)!

        // Fetch featured media if exists
        let media = null
        if (wpPost.featured_media && wpPost.featured_media > 0) {
          try {
            media = await fetchWordPressMedia(config, wpPost.featured_media)
            // Small delay to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, 100))
          } catch (error) {
            console.warn(`Failed to fetch media ${wpPost.featured_media}:`, error)
          }
        }

        const articleData = mapWordPressPostToArticle(wpPost, media)

        // Check if article exists by slug
        const existingArticle = await prisma.article.findUnique({
          where: { slug: articleData.slug },
        })

        if (existingArticle) {
          // Update existing article
          if (!skipExisting) {
            await prisma.article.update({
              where: { id: existingArticle.id },
              data: {
                title: articleData.title,
                excerpt: articleData.excerpt || null,
                content: articleData.content,
                published: articleData.published,
                publishedAt: articleData.publishedAt || null,
                scheduledAt: articleData.scheduledAt || null,
                featuredImage: articleData.featuredImage || null,
                featuredImageTitle: articleData.featuredImageTitle || null,
                featuredImageCaption: articleData.featuredImageCaption || null,
                featuredImageDescription: articleData.featuredImageDescription || null,
                featuredImageAltText: articleData.featuredImageAltText || null,
                metaTitle: articleData.metaTitle || null,
                metaDescription: articleData.metaDescription || null,
                readTime: articleData.readTime,
                featured: articleData.featured,
                categoryId: finalCategoryId,
                editorId,
              },
            })
          }

          results.push({
            type: 'article',
            wpId: wpPost.id,
            title: articleData.title,
            success: true,
            action: skipExisting ? 'skipped' : 'updated',
            slug: articleData.slug,
          })
        } else {
          // Create new article
          let finalSlug = articleData.slug
          let counter = 1
          while (await prisma.article.findUnique({ where: { slug: finalSlug } })) {
            finalSlug = `${articleData.slug}-${counter++}`
          }

          await prisma.article.create({
            data: {
              title: articleData.title,
              slug: finalSlug,
              excerpt: articleData.excerpt || null,
              content: articleData.content,
              published: articleData.published,
              publishedAt: articleData.publishedAt || null,
              scheduledAt: articleData.scheduledAt || null,
              featuredImage: articleData.featuredImage || null,
              featuredImageTitle: articleData.featuredImageTitle || null,
              featuredImageCaption: articleData.featuredImageCaption || null,
              featuredImageDescription: articleData.featuredImageDescription || null,
              featuredImageAltText: articleData.featuredImageAltText || null,
              metaTitle: articleData.metaTitle || null,
              metaDescription: articleData.metaDescription || null,
              readTime: articleData.readTime,
              featured: articleData.featured,
              categoryId: finalCategoryId,
              editorId,
            },
          })

          results.push({
            type: 'article',
            wpId: wpPost.id,
            title: articleData.title,
            success: true,
            action: 'created',
            slug: finalSlug,
          })
        }
      } catch (error) {
        results.push({
          type: 'article',
          wpId: wpPost.id,
          title: wpPost.title?.rendered ? wpPost.title.rendered.replace(/<[^>]*>/g, '') : `Post ${wpPost.id}`,
          success: false,
          action: 'skipped',
          errors: [error instanceof Error ? error.message : 'Unknown error'],
        })
        console.error(`Failed to import post ${wpPost.id}:`, error)
      }
    }

    // Generate summary
    const userResults = results.filter(r => r.type === 'user')
    const categoryResults = results.filter(r => r.type === 'category')
    const articleResults = results.filter(r => r.type === 'article')

    const summary: ImportSummary = {
      users: {
        total: userResults.length,
        successful: userResults.filter(r => r.success).length,
        failed: userResults.filter(r => !r.success).length,
        created: userResults.filter(r => r.success && r.action === 'created').length,
        updated: userResults.filter(r => r.success && r.action === 'updated').length,
      },
      categories: {
        total: categoryResults.length,
        successful: categoryResults.filter(r => r.success).length,
        failed: categoryResults.filter(r => !r.success).length,
        created: categoryResults.filter(r => r.success && r.action === 'created').length,
        updated: categoryResults.filter(r => r.success && r.action === 'updated').length,
      },
      articles: {
        total: articleResults.length,
        successful: articleResults.filter(r => r.success).length,
        failed: articleResults.filter(r => !r.success).length,
        created: articleResults.filter(r => r.success && r.action === 'created').length,
        updated: articleResults.filter(r => r.success && r.action === 'updated').length,
      },
    }

    return NextResponse.json({
      success: true,
      summary,
      results: {
        users: userResults,
        categories: categoryResults,
        articles: articleResults,
      },
    })
  } catch (error) {
    console.error('WordPress REST API import error:', error)
    return NextResponse.json(
      {
        error: 'Failed to import from WordPress REST API',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}


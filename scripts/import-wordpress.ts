#!/usr/bin/env node
/**
 * Standalone WordPress REST API Import Script
 * 
 * This script imports data from WordPress REST API with comprehensive logging.
 * It continues processing even if individual items fail, logging all successes and failures.
 * 
 * Usage:
 *   npm run import:wordpress -- --url https://example.com --username user --password pass
 *   npm run import:wordpress -- --url https://example.com
 * 
 * Options:
 *   --url, -u        WordPress site URL (required)
 *   --username, -U   WordPress username (optional, for private sites)
 *   --password, -P   WordPress application password (optional)
 *   --status         Post statuses to import (default: publish,future)
 *   --skip-existing  Skip updating existing records (default: false)
 *   --verbose, -v    Verbose logging (default: false)
 */

import { PrismaClient } from '@prisma/client'
import {
  testWordPressConnection,
  fetchWordPressUsers,
  fetchWordPressCategories,
  fetchWordPressPosts,
  fetchWordPressMedia,
  type WordPressConfig,
  type WordPressUser,
  type WordPressCategory,
  type WordPressPost,
} from '../lib/wordpress-api-client'
import {
  mapWordPressUserToEditor,
  mapWordPressCategoryToCategory,
  mapWordPressPostToArticle,
  validateWordPressUser,
  validateWordPressCategory,
  validateWordPressPost,
} from '../lib/wordpress-mapper'

const prisma = new PrismaClient()

interface LogEntry {
  timestamp: string
  level: 'INFO' | 'SUCCESS' | 'ERROR' | 'WARN'
  type: 'user' | 'category' | 'article' | 'system'
  message: string
  details?: any
}

class ImportLogger {
  private logs: LogEntry[] = []
  private verbose: boolean

  constructor(verbose: boolean = false) {
    this.verbose = verbose
  }

  log(level: LogEntry['level'], type: LogEntry['type'], message: string, details?: any) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      type,
      message,
      details,
    }
    this.logs.push(entry)

    const prefix = `[${entry.timestamp}] [${level}] [${type.toUpperCase()}]`
    const messageStr = details ? `${message}\n${JSON.stringify(details, null, 2)}` : message

    if (level === 'ERROR') {
      console.error(`${prefix} ${messageStr}`)
    } else if (level === 'WARN') {
      console.warn(`${prefix} ${messageStr}`)
    } else if (this.verbose || level === 'SUCCESS') {
      console.log(`${prefix} ${messageStr}`)
    }
  }

  info(type: LogEntry['type'], message: string, details?: any) {
    this.log('INFO', type, message, details)
  }

  success(type: LogEntry['type'], message: string, details?: any) {
    this.log('SUCCESS', type, message, details)
  }

  error(type: LogEntry['type'], message: string, details?: any) {
    this.log('ERROR', type, message, details)
  }

  warn(type: LogEntry['type'], message: string, details?: any) {
    this.log('WARN', type, message, details)
  }

  getSummary() {
    const summary = {
      total: this.logs.length,
      byLevel: {
        INFO: this.logs.filter(l => l.level === 'INFO').length,
        SUCCESS: this.logs.filter(l => l.level === 'SUCCESS').length,
        ERROR: this.logs.filter(l => l.level === 'ERROR').length,
        WARN: this.logs.filter(l => l.level === 'WARN').length,
      },
      byType: {
        user: this.logs.filter(l => l.type === 'user').length,
        category: this.logs.filter(l => l.type === 'category').length,
        article: this.logs.filter(l => l.type === 'article').length,
        system: this.logs.filter(l => l.type === 'system').length,
      },
    }
    return summary
  }

  getAllLogs() {
    return this.logs
  }

  printSummary() {
    const summary = this.getSummary()
    console.log('\n' + '='.repeat(80))
    console.log('IMPORT SUMMARY')
    console.log('='.repeat(80))
    console.log(`Total log entries: ${summary.total}`)
    console.log(`\nBy Level:`)
    console.log(`  INFO:    ${summary.byLevel.INFO}`)
    console.log(`  SUCCESS: ${summary.byLevel.SUCCESS}`)
    console.log(`  WARN:    ${summary.byLevel.WARN}`)
    console.log(`  ERROR:   ${summary.byLevel.ERROR}`)
    console.log(`\nBy Type:`)
    console.log(`  Users:    ${summary.byType.user}`)
    console.log(`  Categories: ${summary.byType.category}`)
    console.log(`  Articles:  ${summary.byType.article}`)
    console.log(`  System:    ${summary.byType.system}`)
    console.log('='.repeat(80))
  }
}

function normalizeWordPressUrl(url: string): string {
  let baseUrl = url.trim()
  
  if (!baseUrl.startsWith('http://') && !baseUrl.startsWith('https://')) {
    baseUrl = `https://${baseUrl}`
  }
  
  baseUrl = baseUrl.replace(/\/$/, '')
  
  if (baseUrl.includes('/wp-json/wp/v2') || baseUrl.includes('/wp/v2')) {
    const domainMatch = baseUrl.match(/^(https?:\/\/[^\/]+)/)
    if (domainMatch) {
      baseUrl = `${domainMatch[1]}/wp-json`
    }
  } else if (baseUrl.includes('/wp-json')) {
    const wpJsonMatch = baseUrl.match(/^(https?:\/\/[^\/]+(?:\/[^\/]+)*\/wp-json)/)
    if (wpJsonMatch) {
      baseUrl = wpJsonMatch[1]
    }
  } else {
    baseUrl = `${baseUrl}/wp-json`
  }
  
  return baseUrl
}

async function importWordPress(logger: ImportLogger, config: WordPressConfig, options: {
  importStatus?: string[]
  skipExisting?: boolean
}) {
  const { importStatus = ['publish', 'future'], skipExisting = false } = options

  logger.info('system', 'Starting WordPress import', { config: { baseUrl: config.baseUrl }, options })

  // Test connection
  logger.info('system', 'Testing WordPress connection...')
  try {
    const connectionTest = await testWordPressConnection(config)
    if (!connectionTest.success) {
      logger.error('system', 'Connection test failed', { error: connectionTest.message })
      throw new Error(`Connection failed: ${connectionTest.message}`)
    }
    logger.success('system', 'Connection test successful')
  } catch (error) {
    logger.error('system', 'Connection test error', { error: error instanceof Error ? error.message : String(error) })
    throw error
  }

  const wpUserToEditorMap = new Map<number, string>()
  const wpCategoryToCategoryMap = new Map<number, string>()

  // Step 1: Import Users/Editors
  logger.info('system', 'Fetching WordPress users...')
  let wpUsers: WordPressUser[] = []
  try {
    wpUsers = await fetchWordPressUsers(config)
    logger.info('system', `Found ${wpUsers.length} users`)
  } catch (error) {
    logger.error('system', 'Failed to fetch users', { error: error instanceof Error ? error.message : String(error) })
    wpUsers = []
  }

  let usersCreated = 0
  let usersUpdated = 0
  let usersFailed = 0

  for (const wpUser of wpUsers) {
    try {
      const validation = validateWordPressUser(wpUser)
      if (!validation.valid) {
        logger.warn('user', `User ${wpUser.id} validation failed`, {
          wpId: wpUser.id,
          name: wpUser.name,
          errors: validation.errors,
        })
        usersFailed++
        continue
      }

      const editorData = mapWordPressUserToEditor(wpUser)

      let editor = await prisma.editor.findUnique({
        where: { email: editorData.email },
      })

      if (!editor) {
        editor = await prisma.editor.findFirst({
          where: { name: editorData.name },
        })
      }

      if (editor) {
        if (!skipExisting) {
          try {
            editor = await prisma.editor.update({
              where: { id: editor.id },
              data: {
                name: editorData.name,
                bio: editorData.bio || null,
                avatar: editorData.avatar || null,
                slug: editorData.slug || editor.slug,
              },
            })
            logger.success('user', `Updated editor: ${editorData.name}`, {
              wpId: wpUser.id,
              editorId: editor.id,
              slug: editor.slug,
            })
            usersUpdated++
          } catch (error) {
            logger.error('user', `Failed to update editor: ${editorData.name}`, {
              wpId: wpUser.id,
              error: error instanceof Error ? error.message : String(error),
            })
            usersFailed++
            continue
          }
        } else {
          logger.info('user', `Skipped existing editor: ${editorData.name}`, {
            wpId: wpUser.id,
            editorId: editor.id,
          })
        }
        wpUserToEditorMap.set(wpUser.id, editor.id)
      } else {
        try {
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

          logger.success('user', `Created editor: ${editorData.name}`, {
            wpId: wpUser.id,
            editorId: editor.id,
            slug: editor.slug,
            email: finalEmail,
          })
          usersCreated++
          wpUserToEditorMap.set(wpUser.id, editor.id)
        } catch (error) {
          logger.error('user', `Failed to create editor: ${editorData.name}`, {
            wpId: wpUser.id,
            error: error instanceof Error ? error.message : String(error),
          })
          usersFailed++
        }
      }
    } catch (error) {
      logger.error('user', `Unexpected error processing user ${wpUser.id}`, {
        wpId: wpUser.id,
        name: wpUser.name,
        error: error instanceof Error ? error.message : String(error),
      })
      usersFailed++
    }
  }

  logger.info('system', 'Users import completed', {
    total: wpUsers.length,
    created: usersCreated,
    updated: usersUpdated,
    failed: usersFailed,
  })

  // Step 2: Import Categories
  logger.info('system', 'Fetching WordPress categories...')
  let wpCategories: WordPressCategory[] = []
  try {
    wpCategories = await fetchWordPressCategories(config)
    logger.info('system', `Found ${wpCategories.length} categories`)
  } catch (error) {
    logger.error('system', 'Failed to fetch categories', {
      error: error instanceof Error ? error.message : String(error),
    })
    wpCategories = []
  }

  let categoriesCreated = 0
  let categoriesUpdated = 0
  let categoriesFailed = 0

  for (const wpCategory of wpCategories) {
    try {
      const validation = validateWordPressCategory(wpCategory)
      if (!validation.valid) {
        logger.warn('category', `Category ${wpCategory.id} validation failed`, {
          wpId: wpCategory.id,
          name: wpCategory.name,
          errors: validation.errors,
        })
        categoriesFailed++
        continue
      }

      const categoryData = mapWordPressCategoryToCategory(wpCategory)

      let category = await prisma.category.findFirst({
        where: { slug: categoryData.slug },
      })

      if (!category) {
        category = await prisma.category.findFirst({
          where: { name: categoryData.name },
        })
      }

      if (category) {
        if (!skipExisting) {
          try {
            category = await prisma.category.update({
              where: { id: category.id },
              data: {
                name: categoryData.name,
                description: categoryData.description || null,
                slug: categoryData.slug || category.slug,
              },
            })
            logger.success('category', `Updated category: ${categoryData.name}`, {
              wpId: wpCategory.id,
              categoryId: category.id,
              slug: category.slug,
            })
            categoriesUpdated++
          } catch (error) {
            logger.error('category', `Failed to update category: ${categoryData.name}`, {
              wpId: wpCategory.id,
              error: error instanceof Error ? error.message : String(error),
            })
            categoriesFailed++
            continue
          }
        } else {
          logger.info('category', `Skipped existing category: ${categoryData.name}`, {
            wpId: wpCategory.id,
            categoryId: category.id,
          })
        }
        wpCategoryToCategoryMap.set(wpCategory.id, category.id)
      } else {
        try {
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

          logger.success('category', `Created category: ${categoryData.name}`, {
            wpId: wpCategory.id,
            categoryId: category.id,
            slug: category.slug,
          })
          categoriesCreated++
          wpCategoryToCategoryMap.set(wpCategory.id, category.id)
        } catch (error) {
          logger.error('category', `Failed to create category: ${categoryData.name}`, {
            wpId: wpCategory.id,
            error: error instanceof Error ? error.message : String(error),
          })
          categoriesFailed++
        }
      }
    } catch (error) {
      logger.error('category', `Unexpected error processing category ${wpCategory.id}`, {
        wpId: wpCategory.id,
        name: wpCategory.name,
        error: error instanceof Error ? error.message : String(error),
      })
      categoriesFailed++
    }
  }

  logger.info('system', 'Categories import completed', {
    total: wpCategories.length,
    created: categoriesCreated,
    updated: categoriesUpdated,
    failed: categoriesFailed,
  })

  // Step 3: Import Posts/Articles
  logger.info('system', 'Fetching WordPress posts...', { status: importStatus })
  let wpPosts: WordPressPost[] = []
  try {
    wpPosts = await fetchWordPressPosts(config, Array.isArray(importStatus) ? importStatus : ['publish'])
    logger.info('system', `Found ${wpPosts.length} posts`)
  } catch (error) {
    logger.error('system', 'Failed to fetch posts', {
      error: error instanceof Error ? error.message : String(error),
    })
    wpPosts = []
  }

  let articlesCreated = 0
  let articlesUpdated = 0
  let articlesFailed = 0

  // Create default category if needed
  let defaultCategoryId: string | null = null
  try {
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
      logger.info('category', 'Created default "General" category')
    }
    defaultCategoryId = defaultCategory.id
    wpCategoryToCategoryMap.set(0, defaultCategory.id)
  } catch (error) {
    logger.error('category', 'Failed to create/find default category', {
      error: error instanceof Error ? error.message : String(error),
    })
  }

  for (const wpPost of wpPosts) {
    try {
      const validation = validateWordPressPost(wpPost)
      if (!validation.valid) {
        const title = wpPost.title?.rendered ? wpPost.title.rendered.replace(/<[^>]*>/g, '') : `Post ${wpPost.id}`
        logger.warn('article', `Post ${wpPost.id} validation failed`, {
          wpId: wpPost.id,
          title,
          errors: validation.errors,
        })
        articlesFailed++
        continue
      }

      // Resolve author
      const editorId = wpUserToEditorMap.get(wpPost.author)
      if (!editorId) {
        const title = wpPost.title?.rendered ? wpPost.title.rendered.replace(/<[^>]*>/g, '') : `Post ${wpPost.id}`
        logger.warn('article', `Post ${wpPost.id} has no matching editor`, {
          wpId: wpPost.id,
          title,
          authorId: wpPost.author,
        })
        articlesFailed++
        continue
      }

      // Resolve category
      const categoryId = wpPost.categories.length > 0
        ? wpCategoryToCategoryMap.get(wpPost.categories[0])
        : null

      const finalCategoryId = categoryId || defaultCategoryId
      if (!finalCategoryId) {
        const title = wpPost.title?.rendered ? wpPost.title.rendered.replace(/<[^>]*>/g, '') : `Post ${wpPost.id}`
        logger.error('article', `Post ${wpPost.id} has no category and no default category`, {
          wpId: wpPost.id,
          title,
        })
        articlesFailed++
        continue
      }

      // Fetch featured media
      let media = null
      if (wpPost.featured_media && wpPost.featured_media > 0) {
        try {
          media = await fetchWordPressMedia(config, wpPost.featured_media)
          await new Promise(resolve => setTimeout(resolve, 100)) // Rate limiting
        } catch (error) {
          logger.warn('article', `Failed to fetch media ${wpPost.featured_media} for post ${wpPost.id}`, {
            wpId: wpPost.id,
            mediaId: wpPost.featured_media,
            error: error instanceof Error ? error.message : String(error),
          })
        }
      }

      const articleData = mapWordPressPostToArticle(wpPost, media)

      // Check if article exists
      const existingArticle = await prisma.article.findUnique({
        where: { slug: articleData.slug },
      })

      if (existingArticle) {
        if (!skipExisting) {
          try {
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
            logger.success('article', `Updated article: ${articleData.title}`, {
              wpId: wpPost.id,
              articleId: existingArticle.id,
              slug: articleData.slug,
            })
            articlesUpdated++
          } catch (error) {
            logger.error('article', `Failed to update article: ${articleData.title}`, {
              wpId: wpPost.id,
              slug: articleData.slug,
              error: error instanceof Error ? error.message : String(error),
            })
            articlesFailed++
          }
        } else {
          logger.info('article', `Skipped existing article: ${articleData.title}`, {
            wpId: wpPost.id,
            articleId: existingArticle.id,
          })
        }
      } else {
        try {
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

          logger.success('article', `Created article: ${articleData.title}`, {
            wpId: wpPost.id,
            slug: finalSlug,
          })
          articlesCreated++
        } catch (error) {
          logger.error('article', `Failed to create article: ${articleData.title}`, {
            wpId: wpPost.id,
            slug: articleData.slug,
            error: error instanceof Error ? error.message : String(error),
          })
          articlesFailed++
        }
      }
    } catch (error) {
      const title = wpPost.title?.rendered ? wpPost.title.rendered.replace(/<[^>]*>/g, '') : `Post ${wpPost.id}`
      logger.error('article', `Unexpected error processing post ${wpPost.id}`, {
        wpId: wpPost.id,
        title,
        error: error instanceof Error ? error.message : String(error),
      })
      articlesFailed++
    }
  }

  logger.info('system', 'Articles import completed', {
    total: wpPosts.length,
    created: articlesCreated,
    updated: articlesUpdated,
    failed: articlesFailed,
  })

  return {
    users: { total: wpUsers.length, created: usersCreated, updated: usersUpdated, failed: usersFailed },
    categories: { total: wpCategories.length, created: categoriesCreated, updated: categoriesUpdated, failed: categoriesFailed },
    articles: { total: wpPosts.length, created: articlesCreated, updated: articlesUpdated, failed: articlesFailed },
  }
}

// Parse command line arguments
function parseArgs() {
  const args = process.argv.slice(2)
  const options: {
    url?: string
    username?: string
    password?: string
    status?: string[]
    skipExisting?: boolean
    verbose?: boolean
  } = {}

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    const nextArg = args[i + 1]

    if (arg === '--url' || arg === '-u') {
      options.url = nextArg
      i++
    } else if (arg === '--username' || arg === '-U') {
      options.username = nextArg
      i++
    } else if (arg === '--password' || arg === '-P') {
      options.password = nextArg
      i++
    } else if (arg === '--status') {
      options.status = nextArg.split(',').map(s => s.trim())
      i++
    } else if (arg === '--skip-existing') {
      options.skipExisting = true
    } else if (arg === '--verbose' || arg === '-v') {
      options.verbose = true
    }
  }

  return options
}

async function main() {
  const options = parseArgs()

  if (!options.url) {
    console.error('Error: WordPress URL is required')
    console.error('\nUsage:')
    console.error('  npm run import:wordpress -- --url https://example.com [options]')
    console.error('\nOptions:')
    console.error('  --url, -u           WordPress site URL (required)')
    console.error('  --username, -U       WordPress username (optional)')
    console.error('  --password, -P       WordPress application password (optional)')
    console.error('  --status            Post statuses to import (default: publish,future)')
    console.error('  --skip-existing     Skip updating existing records')
    console.error('  --verbose, -v        Verbose logging')
    process.exit(1)
  }

  const logger = new ImportLogger(options.verbose || false)

  try {
    const normalizedUrl = normalizeWordPressUrl(options.url)
    logger.info('system', 'Normalized WordPress URL', { original: options.url, normalized: normalizedUrl })

    const config: WordPressConfig = {
      baseUrl: normalizedUrl,
      username: options.username,
      password: options.password,
      timeout: 30000,
    }

    const summary = await importWordPress(logger, config, {
      importStatus: options.status,
      skipExisting: options.skipExisting || false,
    })

    logger.printSummary()

    console.log('\n📊 FINAL SUMMARY:')
    console.log(`  Users:    ${summary.users.created} created, ${summary.users.updated} updated, ${summary.users.failed} failed`)
    console.log(`  Categories: ${summary.categories.created} created, ${summary.categories.updated} updated, ${summary.categories.failed} failed`)
    console.log(`  Articles:  ${summary.articles.created} created, ${summary.articles.updated} updated, ${summary.articles.failed} failed`)

    const totalFailed = summary.users.failed + summary.categories.failed + summary.articles.failed
    if (totalFailed > 0) {
      console.log(`\n⚠️  ${totalFailed} items failed. Check logs above for details.`)
      process.exit(1)
    } else {
      console.log('\n✅ Import completed successfully!')
      process.exit(0)
    }
  } catch (error) {
    logger.error('system', 'Fatal error during import', {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    logger.printSummary()
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()


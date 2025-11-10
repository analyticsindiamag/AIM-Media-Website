/**
 * Script to decode HTML entities in existing database records
 * Run this script to fix HTML entities in already imported articles
 * 
 * Usage:
 *   npx tsx scripts/decode-existing-entities.ts
 * 
 * Or add to package.json:
 *   "scripts": {
 *     "fix-entities": "tsx scripts/decode-existing-entities.ts"
 *   }
 */

import { PrismaClient } from '@prisma/client'
import { decodeHtmlEntities } from '../lib/wordpress-mapper'

const prisma = new PrismaClient()

async function decodeExistingEntities() {
  console.log('Starting HTML entity decoding for existing records...\n')

  try {
    // Update Articles
    console.log('Updating articles...')
    const articles = await prisma.article.findMany({
      select: {
        id: true,
        title: true,
        content: true,
        excerpt: true,
        metaTitle: true,
        metaDescription: true,
        featuredImageTitle: true,
        featuredImageCaption: true,
        featuredImageDescription: true,
        featuredImageAltText: true,
      },
    })

    let articlesUpdated = 0
    for (const article of articles) {
      const updates: any = {}
      let hasChanges = false

      if (article.title && article.title.includes('&')) {
        const decoded = decodeHtmlEntities(article.title)
        if (decoded !== article.title) {
          updates.title = decoded
          hasChanges = true
        }
      }

      if (article.content && article.content.includes('&')) {
        const decoded = decodeHtmlEntities(article.content)
        if (decoded !== article.content) {
          updates.content = decoded
          hasChanges = true
        }
      }

      if (article.excerpt && article.excerpt.includes('&')) {
        const decoded = decodeHtmlEntities(article.excerpt)
        if (decoded !== article.excerpt) {
          updates.excerpt = decoded
          hasChanges = true
        }
      }

      if (article.metaTitle && article.metaTitle.includes('&')) {
        const decoded = decodeHtmlEntities(article.metaTitle)
        if (decoded !== article.metaTitle) {
          updates.metaTitle = decoded
          hasChanges = true
        }
      }

      if (article.metaDescription && article.metaDescription.includes('&')) {
        const decoded = decodeHtmlEntities(article.metaDescription)
        if (decoded !== article.metaDescription) {
          updates.metaDescription = decoded
          hasChanges = true
        }
      }

      if (article.featuredImageTitle && article.featuredImageTitle.includes('&')) {
        const decoded = decodeHtmlEntities(article.featuredImageTitle)
        if (decoded !== article.featuredImageTitle) {
          updates.featuredImageTitle = decoded
          hasChanges = true
        }
      }

      if (article.featuredImageCaption && article.featuredImageCaption.includes('&')) {
        const decoded = decodeHtmlEntities(article.featuredImageCaption)
        if (decoded !== article.featuredImageCaption) {
          updates.featuredImageCaption = decoded
          hasChanges = true
        }
      }

      if (article.featuredImageDescription && article.featuredImageDescription.includes('&')) {
        const decoded = decodeHtmlEntities(article.featuredImageDescription)
        if (decoded !== article.featuredImageDescription) {
          updates.featuredImageDescription = decoded
          hasChanges = true
        }
      }

      if (article.featuredImageAltText && article.featuredImageAltText.includes('&')) {
        const decoded = decodeHtmlEntities(article.featuredImageAltText)
        if (decoded !== article.featuredImageAltText) {
          updates.featuredImageAltText = decoded
          hasChanges = true
        }
      }

      if (hasChanges) {
        await prisma.article.update({
          where: { id: article.id },
          data: updates,
        })
        articlesUpdated++
      }
    }

    console.log(`✓ Updated ${articlesUpdated} articles\n`)

    // Update Categories
    console.log('Updating categories...')
    const categories = await prisma.category.findMany({
      select: {
        id: true,
        name: true,
        description: true,
      },
    })

    let categoriesUpdated = 0
    for (const category of categories) {
      const updates: any = {}
      let hasChanges = false

      if (category.name && category.name.includes('&')) {
        const decoded = decodeHtmlEntities(category.name)
        if (decoded !== category.name) {
          updates.name = decoded
          hasChanges = true
        }
      }

      if (category.description && category.description.includes('&')) {
        const decoded = decodeHtmlEntities(category.description)
        if (decoded !== category.description) {
          updates.description = decoded
          hasChanges = true
        }
      }

      if (hasChanges) {
        await prisma.category.update({
          where: { id: category.id },
          data: updates,
        })
        categoriesUpdated++
      }
    }

    console.log(`✓ Updated ${categoriesUpdated} categories\n`)

    // Update Editors
    console.log('Updating editors...')
    const editors = await prisma.editor.findMany({
      select: {
        id: true,
        name: true,
        bio: true,
      },
    })

    let editorsUpdated = 0
    for (const editor of editors) {
      const updates: any = {}
      let hasChanges = false

      if (editor.name && editor.name.includes('&')) {
        const decoded = decodeHtmlEntities(editor.name)
        if (decoded !== editor.name) {
          updates.name = decoded
          hasChanges = true
        }
      }

      if (editor.bio && editor.bio.includes('&')) {
        const decoded = decodeHtmlEntities(editor.bio)
        if (decoded !== editor.bio) {
          updates.bio = decoded
          hasChanges = true
        }
      }

      if (hasChanges) {
        await prisma.editor.update({
          where: { id: editor.id },
          data: updates,
        })
        editorsUpdated++
      }
    }

    console.log(`✓ Updated ${editorsUpdated} editors\n`)

    console.log('✅ HTML entity decoding completed!')
    console.log(`\nSummary:`)
    console.log(`  - Articles: ${articlesUpdated} updated`)
    console.log(`  - Categories: ${categoriesUpdated} updated`)
    console.log(`  - Editors: ${editorsUpdated} updated`)
  } catch (error) {
    console.error('Error decoding HTML entities:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
decodeExistingEntities()
  .then(() => {
    console.log('\n✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error)
    process.exit(1)
  })


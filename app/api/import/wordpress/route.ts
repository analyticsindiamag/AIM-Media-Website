import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

function detectDelimiter(headerLine: string): string {
  // Prefer tab if present, else comma
  return headerLine.includes('\t') ? '\t' : ','
}

function parseCSVLine(line: string, delimiter: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      // Toggle quote state or escape double quote
      if (inQuotes && line[i + 1] === '"') {
        current += '"'
        i++
      } else {
        inQuotes = !inQuotes
      }
    } else if (ch === delimiter && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += ch
    }
  }
  result.push(current)
  return result
}

function normalizeHeader(h: string): string {
  return h.trim().replace(/^\ufeff/, '').toLowerCase()
}

function toSlug(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    const text = await file.text()
    const lines = text.split(/\r?\n/).filter((l) => l.length > 0)
    if (lines.length === 0) {
      return NextResponse.json({ error: 'Empty file' }, { status: 400 })
    }

    const delimiter = detectDelimiter(lines[0])
    const rawHeaders = parseCSVLine(lines[0], delimiter)
    const headers = rawHeaders.map(normalizeHeader)

    let success = 0
    let failed = 0
    const errors: string[] = []

    for (let i = 1; i < lines.length; i++) {
      const rawLine = lines[i]
      if (!rawLine.trim()) continue
      try {
        const values = parseCSVLine(rawLine, delimiter).map((v) => v.replace(/^"|"$/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => {
          row[h] = values[idx] ?? ''
        })

        // Support both old and new schemas by mapping possible header names
        const get = (keys: string[]): string => {
          for (const k of keys) {
            const nk = normalizeHeader(k)
            if (row[nk]) return row[nk]
          }
          return ''
        }

        const title = get(['title', 'post_title'])
        const content = get(['content', 'post_content'])
        const excerpt = get(['excerpt', 'post_excerpt'])
        const date = get(['date', 'post_date'])
        const categoryRaw = get(['categories', 'category'])
        let imageUrl = get(['image url', 'featured_image_url', 'imageurl'])
        if (imageUrl && imageUrl.includes('|')) {
          imageUrl = imageUrl
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean)[0] || ''
        }
        const status = get(['status']) || 'publish'
        const authorFirst = get(['author first name'])
        const authorLast = get(['author last name'])
        const authorUsername = get(['author username', 'post_author'])
        const authorEmail = get(['author email'])
        const slugProvided = get(['slug'])

        if (!title || !content) {
          throw new Error('Missing title/content')
        }

        // Determine category (first if multiple separated by ; , |)
        const categoryName = (categoryRaw || 'General')
          .split(/[;|,]/)[0]
          .replace(/&amp;/g, '&')
          .trim()
        const categorySlug = toSlug(categoryName || 'general')

        let category = await prisma.category.findFirst({
          where: { slug: categorySlug },
        })
        if (!category) {
          category = await prisma.category.create({
            data: { name: categoryName || 'General', slug: categorySlug },
          })
        }

        // Determine editor - prioritize email matching, then name
        const editorName = [authorFirst, authorLast].filter(Boolean).join(' ').trim() || authorUsername || 'Admin'
        const editorEmail = (authorEmail || `${(authorUsername || 'admin').toLowerCase()}@example.com`).trim()
        
        let editor = null
        if (authorEmail) {
          // Try to find by email first (more reliable)
          editor = await prisma.editor.findUnique({
            where: { email: editorEmail },
          })
        }
        
        if (!editor) {
          // Try to find by name
          editor = await prisma.editor.findFirst({
            where: { name: editorName },
          })
        }
        
        if (!editor) {
          // Create new editor, ensuring email is unique
          try {
            editor = await prisma.editor.create({ 
              data: { 
                name: editorName, 
                email: editorEmail 
              } 
            })
          } catch (error) {
            // If email conflict, try with a unique email
            const uniqueEmail = `${editorEmail.split('@')[0]}-${Date.now()}@${editorEmail.split('@')[1] || 'example.com'}`
            editor = await prisma.editor.create({ 
              data: { 
                name: editorName, 
                email: uniqueEmail 
              } 
            })
          }
        }

        // Slug
        const baseSlug = toSlug(slugProvided || title)

        // Check if article exists by slug for update
        const existingArticle = await prisma.article.findUnique({ 
          where: { slug: baseSlug } 
        })

        // Read time
        const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
        const readTime = Math.ceil(wordCount / 200)

        // Publish flags
        const published = status.toLowerCase() === 'publish'
        const publishedAt = date ? new Date(date) : new Date()

        // Upsert: update if exists, create if not
        if (existingArticle) {
          // Update existing article, ensuring category and editor exist
          // Handle publishedAt: use CSV date if publishing, preserve existing if unpublishing, null if unpublishing
          let finalPublishedAt = null
          if (published) {
            finalPublishedAt = date ? new Date(date) : (existingArticle.publishedAt || new Date())
          }
          
          await prisma.article.update({
            where: { id: existingArticle.id },
            data: {
              title,
              excerpt: excerpt || null,
              content,
              featuredImage: imageUrl || null,
              published,
              publishedAt: finalPublishedAt,
              readTime,
              categoryId: category.id, // Ensure category exists
              editorId: editor.id, // Ensure editor exists
            },
          })
        } else {
          // Create new article with unique slug if needed
          let uniqueSlug = baseSlug
          let counter = 1
          while (await prisma.article.findUnique({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${baseSlug}-${counter++}`
          }

          await prisma.article.create({
            data: {
              title,
              slug: uniqueSlug,
              excerpt: excerpt || null,
              content,
              featuredImage: imageUrl || null,
              published,
              publishedAt: published ? publishedAt : null,
              readTime,
              categoryId: category.id,
              editorId: editor.id,
            },
          })
        }

        success++
      } catch (error: unknown) {
        failed++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        errors.push(`Row ${i}: ${errorMessage}`)
        console.error(`Failed to import row ${i}:`, error)
      }
    }

    return NextResponse.json({ success, failed, errors: errors.slice(0, 20) })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Failed to import CSV' }, { status: 500 })
  }
}


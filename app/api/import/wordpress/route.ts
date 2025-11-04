import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Types for import report
interface ImportRowData {
  title: string
  content: string
  excerpt: string
  date: string
  categoryRaw: string
  imageUrl: string
  imageTitle: string
  imageCaption: string
  imageDescription: string
  imageAltText: string
  status: string
  authorFirst: string
  authorLast: string
  authorUsername: string
  authorEmail: string
  permalink: string
  slugProvided: string
  metaTitle: string
  metaDescription: string
  finalSlug: string
}

interface ValidationResult {
  valid: boolean
  errors: string[]
}

interface ImportResult {
  rowNumber: number
  title: string
  success: boolean
  action: 'created' | 'updated' | 'skipped'
  slug?: string
  errors?: string[]
}

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

// Extract row data from CSV row
function extractRowData(row: Record<string, string>, get: (keys: string[]) => string): ImportRowData {
        // Core article fields
        const title = get(['title', 'post_title'])
        const content = get(['content', 'post_content'])
        const excerpt = get(['excerpt', 'post_excerpt'])
        const date = get(['date', 'post_date'])
        const categoryRaw = get(['categories', 'category'])
        
        // Image handling - WordPress CSV uses "Image URL" column
        let imageUrl = get([
          'image url',           // WordPress CSV format
          'featured_image_url',  // Legacy format
          'imageurl',            // Legacy format
          'image featured'      // Alternative WordPress field
        ])
        // Handle pipe-separated image URLs (take first)
        if (imageUrl && imageUrl.includes('|')) {
          imageUrl = imageUrl
            .split('|')
            .map((s) => s.trim())
            .filter(Boolean)[0] || ''
        }
        
        // Image metadata for SEO
        const imageTitle = get(['image title', 'image_title'])
        const imageCaption = get(['image caption', 'image_caption'])
        const imageDescription = get(['image description', 'image_description'])
        const imageAltText = get(['image alt text', 'image_alt_text', 'image alt'])
        
        // Status and publication
        const status = get(['status']) || 'publish'
        
        // Author/Editor fields
        const authorFirst = get(['author first name', 'author_first_name'])
        const authorLast = get(['author last name', 'author_last_name'])
        const authorUsername = get(['author username', 'author_username', 'post_author'])
        const authorEmail = get(['author email', 'author_email'])
        
        // Permalink and Slug - WordPress format: /category-slug/article-slug
        const permalink = get(['permalink'])
        const slugProvided = get(['slug'])
        
  // Extract slug from permalink if provided
        let finalSlug = slugProvided
        if (permalink) {
          try {
            const url = new URL(permalink)
            const pathParts = url.pathname.split('/').filter(Boolean)
            if (pathParts.length > 0) {
              finalSlug = pathParts[pathParts.length - 1]
            }
          } catch {
            // If permalink is not a full URL, try to parse it as a path
            const pathParts = permalink.split('/').filter(Boolean)
            if (pathParts.length > 0) {
              finalSlug = pathParts[pathParts.length - 1]
            }
          }
        }
        
        // SEO fields
        const metaTitle = get(['meta_title', 'meta title'])
        const metaDescription = get(['meta_description', 'meta description'])

  return {
    title,
    content,
    excerpt,
    date,
    categoryRaw,
    imageUrl,
    imageTitle,
    imageCaption,
    imageDescription,
    imageAltText,
    status,
    authorFirst,
    authorLast,
    authorUsername,
    authorEmail,
    permalink,
    slugProvided,
    metaTitle,
    metaDescription,
    finalSlug,
  }
}

// Validate row data before import
function validateRowData(data: ImportRowData): ValidationResult {
  const errors: string[] = []

  // Required fields
  if (!data.title || !data.title.trim()) {
    errors.push('Title is required')
  } else if (data.title.trim().length > 500) {
    errors.push('Title is too long (max 500 characters)')
  }

  if (!data.content || !data.content.trim()) {
    errors.push('Content is required')
  } else {
    const contentLength = data.content.trim().length
    if (contentLength < 10) {
      errors.push('Content is too short (minimum 10 characters)')
    }
    // Check for reasonable max length (e.g., 1MB of text)
    if (contentLength > 1000000) {
      errors.push('Content is too long (max 1,000,000 characters)')
    }
  }

  // Excerpt validation (optional field)
  if (data.excerpt && data.excerpt.trim()) {
    const excerptLength = data.excerpt.trim().length
    if (excerptLength > 500) {
      errors.push(`Excerpt is too long (max 500 characters): "${data.excerpt.substring(0, 50)}..."`)
    }
  }

  // Date validation
  if (data.date) {
    const dateObj = new Date(data.date)
    if (isNaN(dateObj.getTime())) {
      errors.push(`Invalid date format: "${data.date}". Expected ISO format (YYYY-MM-DD)`)
    } else {
      // Check if date is reasonable (not too far in the future)
      const maxDate = new Date()
      maxDate.setFullYear(maxDate.getFullYear() + 1)
      if (dateObj > maxDate) {
        errors.push(`Date is too far in the future: "${data.date}"`)
      }
    }
  }

  // Email validation
  if (data.authorEmail && data.authorEmail.trim()) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(data.authorEmail.trim())) {
      errors.push(`Invalid email format: "${data.authorEmail}"`)
    }
  }

  // URL validation for image
  if (data.imageUrl && data.imageUrl.trim()) {
    try {
      new URL(data.imageUrl.trim())
    } catch {
      errors.push(`Invalid image URL format: "${data.imageUrl}"`)
    }
  }

  // URL validation for permalink
  if (data.permalink && data.permalink.trim()) {
    try {
      new URL(data.permalink.trim())
    } catch {
      // Try to see if it's a relative path
      if (!data.permalink.trim().startsWith('/')) {
        errors.push(`Invalid permalink format: "${data.permalink}"`)
      }
    }
  }

  // Status validation
  const validStatuses = ['publish', 'draft', 'pending', 'private']
  if (data.status && !validStatuses.includes(data.status.toLowerCase())) {
    errors.push(`Invalid status: "${data.status}". Valid values are: ${validStatuses.join(', ')}`)
  }

  // Slug validation (if provided) - we'll convert to slug format, so just check for reasonable length
  if (data.finalSlug && data.finalSlug.trim()) {
    const slugLength = data.finalSlug.trim().length
    if (slugLength > 200) {
      errors.push(`Slug is too long (max 200 characters): "${data.finalSlug}"`)
    }
    // Note: We'll convert slug to proper format during import, so we don't need strict format validation here
  }

  // Category validation
  if (data.categoryRaw && data.categoryRaw.trim()) {
    const categoryName = data.categoryRaw.split(/[;|,]/)[0].replace(/&amp;/g, '&').trim()
    if (categoryName.length > 100) {
      errors.push(`Category name is too long (max 100 characters): "${categoryName}"`)
    }
  }

  // Editor name validation
  const editorName = [data.authorFirst, data.authorLast].filter(Boolean).join(' ').trim() || data.authorUsername || 'Admin'
  if (editorName.length > 200) {
    errors.push(`Editor name is too long (max 200 characters): "${editorName}"`)
  }

  // Meta title validation (optional SEO field)
  if (data.metaTitle && data.metaTitle.trim()) {
    const metaTitleLength = data.metaTitle.trim().length
    if (metaTitleLength > 60) {
      errors.push(`Meta title is too long (max 60 characters recommended for SEO): "${data.metaTitle}"`)
    }
  }

  // Meta description validation (optional SEO field)
  if (data.metaDescription && data.metaDescription.trim()) {
    const metaDescLength = data.metaDescription.trim().length
    if (metaDescLength > 160) {
      errors.push(`Meta description is too long (max 160 characters recommended for SEO): "${data.metaDescription.substring(0, 50)}..."`)
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
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

    // Step 1: Parse and validate all rows first
    interface ParsedRow {
      rowNumber: number
      rowData: ImportRowData
      validation: ValidationResult
    }

    const parsedRows: ParsedRow[] = []

    for (let i = 1; i < lines.length; i++) {
      const rawLine = lines[i]
      if (!rawLine.trim()) continue

      try {
        const values = parseCSVLine(rawLine, delimiter).map((v) => v.replace(/^"|"$/g, ''))
        const row: Record<string, string> = {}
        headers.forEach((h, idx) => {
          row[h] = values[idx] ?? ''
        })

        const get = (keys: string[]): string => {
          for (const k of keys) {
            const nk = normalizeHeader(k)
            if (row[nk]) return row[nk]
          }
          return ''
        }

        const rowData = extractRowData(row, get)
        const validation = validateRowData(rowData)

        parsedRows.push({
          rowNumber: i,
          rowData,
          validation,
        })
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to parse row'
        parsedRows.push({
          rowNumber: i,
          rowData: {} as ImportRowData,
          validation: {
            valid: false,
            errors: [`Parse error: ${errorMessage}`],
          },
        })
      }
    }

    // Step 2: Import only valid rows
    const results: ImportResult[] = []

    for (const parsedRow of parsedRows) {
      const { rowNumber, rowData, validation } = parsedRow

      if (!validation.valid) {
        // Row failed validation - skip import
        results.push({
          rowNumber,
          title: rowData.title || `Row ${rowNumber}`,
          success: false,
          action: 'skipped',
          errors: validation.errors,
        })
        continue
      }

      // Row is valid - proceed with import
      try {
        const {
          title,
          content,
          excerpt,
          date,
          categoryRaw,
          imageUrl,
          imageTitle,
          imageCaption,
          imageDescription,
          imageAltText,
          status,
          authorFirst,
          authorLast,
          authorUsername,
          authorEmail,
          metaTitle,
          metaDescription,
          finalSlug,
        } = rowData

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
          editor = await prisma.editor.findUnique({
            where: { email: editorEmail },
          })
        }
        
        if (!editor) {
          editor = await prisma.editor.findFirst({
            where: { name: editorName },
          })
        }
        
        if (!editor) {
          const baseEditorSlug = toSlug(editorName || (authorUsername || 'admin')) || `editor-${Date.now()}`
          let finalEditorSlug = baseEditorSlug
          let suffix = 1
          while (await prisma.editor.findFirst({ where: { slug: finalEditorSlug } })) {
            finalEditorSlug = `${baseEditorSlug}-${suffix++}`
          }

          try {
            editor = await prisma.editor.create({ 
              data: { 
                name: editorName, 
                email: editorEmail,
                slug: finalEditorSlug,
              } 
            })
          } catch (error) {
            const uniqueEmail = `${editorEmail.split('@')[0]}-${Date.now()}@${editorEmail.split('@')[1] || 'example.com'}`
            editor = await prisma.editor.create({ 
              data: { 
                name: editorName, 
                email: uniqueEmail,
                slug: finalEditorSlug,
              } 
            })
          }
        }

        // Slug - use extracted slug from permalink, or fallback to generated slug
        const baseSlug = toSlug(finalSlug || title)

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
          let finalPublishedAt = null
          if (published) {
            finalPublishedAt = date ? new Date(date) : (existingArticle.publishedAt || new Date())
          }
          
          const updateData: any = {
              title,
              excerpt: excerpt || null,
              content,
              featuredImage: imageUrl || null,
              published,
              publishedAt: finalPublishedAt,
              readTime,
              categoryId: category.id,
              editorId: editor.id,
          }
          
          if (imageTitle) updateData.featuredImageTitle = imageTitle
          if (imageCaption) updateData.featuredImageCaption = imageCaption
          if (imageDescription) updateData.featuredImageDescription = imageDescription
          if (imageAltText) updateData.featuredImageAltText = imageAltText
          if (metaTitle) updateData.metaTitle = metaTitle
          if (metaDescription) updateData.metaDescription = metaDescription
          
          await prisma.article.update({
            where: { id: existingArticle.id },
            data: updateData,
          })

          results.push({
            rowNumber,
            title,
            success: true,
            action: 'updated',
            slug: baseSlug,
          })
        } else {
          let uniqueSlug = baseSlug
          let counter = 1
          while (await prisma.article.findUnique({ where: { slug: uniqueSlug } })) {
            uniqueSlug = `${baseSlug}-${counter++}`
          }

          const createData: any = {
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
          }
          
          if (imageTitle) createData.featuredImageTitle = imageTitle
          if (imageCaption) createData.featuredImageCaption = imageCaption
          if (imageDescription) createData.featuredImageDescription = imageDescription
          if (imageAltText) createData.featuredImageAltText = imageAltText
          if (metaTitle) createData.metaTitle = metaTitle
          if (metaDescription) createData.metaDescription = metaDescription

          await prisma.article.create({
            data: createData,
          })

          results.push({
            rowNumber,
            title,
            success: true,
            action: 'created',
            slug: uniqueSlug,
          })
        }
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        results.push({
          rowNumber,
          title: rowData.title || `Row ${rowNumber}`,
          success: false,
          action: 'skipped',
          errors: [`Import error: ${errorMessage}`],
        })
        console.error(`Failed to import row ${rowNumber}:`, error)
      }
    }

    // Step 3: Generate comprehensive report
    const successful = results.filter(r => r.success)
    const failed = results.filter(r => !r.success)
    const created = successful.filter(r => r.action === 'created')
    const updated = successful.filter(r => r.action === 'updated')

    return NextResponse.json({
      summary: {
        total: results.length,
        successful: successful.length,
        failed: failed.length,
        created: created.length,
        updated: updated.length,
      },
      successful: successful.map(r => ({
        rowNumber: r.rowNumber,
        title: r.title,
        action: r.action,
        slug: r.slug,
      })),
      failed: failed.map(r => ({
        rowNumber: r.rowNumber,
        title: r.title,
        errors: r.errors || ['Unknown error'],
      })),
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json({ error: 'Failed to import CSV' }, { status: 500 })
  }
}


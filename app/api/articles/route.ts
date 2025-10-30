import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const articles = await prisma.article.findMany({
      include: {
        category: true,
        editor: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json(articles)
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch articles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      title,
      slug,
      excerpt,
      content,
      featuredImage,
      categoryId,
      editorId,
      published,
      metaTitle,
      metaDescription,
      featured,
    } = body

    if (!title || !slug || !content || !categoryId || !editorId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const normalizedSlug = String(slug)
      .toLowerCase()
      .replace(/[^a-z0-9-]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Unique slug check
    const existing = await prisma.article.findUnique({ where: { slug: normalizedSlug } })
    if (existing) {
      return NextResponse.json({ error: 'Slug already exists' }, { status: 409 })
    }

    // Calculate read time (rough estimate: 200 words per minute)
    const wordCount = String(content).replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    const readTime = Math.ceil(wordCount / 200)

    // If setting featured, unset others first
    if (featured) {
      await prisma.article.updateMany({ data: { featured: false }, where: { featured: true } })
    }

    const article = await prisma.article.create({
      data: {
        title,
        slug: normalizedSlug,
        excerpt,
        content,
        featuredImage,
        categoryId,
        editorId,
        published,
        publishedAt: published ? new Date() : null,
        readTime,
        metaTitle,
        metaDescription,
        featured: !!featured,
      },
      include: {
        category: true,
        editor: true,
      },
    })

    return NextResponse.json({ article }, { status: 201 })
  } catch (error) {
    console.error('Create article error:', error)
    return NextResponse.json(
      { error: 'Failed to create article' },
      { status: 500 }
    )
  }
}


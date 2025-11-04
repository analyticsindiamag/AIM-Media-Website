import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        editor: true,
      },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    return NextResponse.json(article)
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch article' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
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
      scheduledAt,
      metaTitle,
      metaDescription,
      featured,
    } = body

    // Validate required fields
    if (!title || !slug || !content || !categoryId || !editorId) {
      return NextResponse.json(
        { error: 'Missing required fields: title, slug, content, categoryId, editorId' },
        { status: 400 }
      )
    }

    // Verify category exists
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    })
    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Verify editor exists
    const editor = await prisma.editor.findUnique({
      where: { id: editorId },
    })
    if (!editor) {
      return NextResponse.json(
        { error: 'Editor not found' },
        { status: 404 }
      )
    }

    // Verify article exists
    const existingArticle = await prisma.article.findUnique({
      where: { id },
    })
    if (!existingArticle) {
      return NextResponse.json(
        { error: 'Article not found' },
        { status: 404 }
      )
    }

    // Check if slug is already taken by another article
    if (slug !== existingArticle.slug) {
      const slugConflict = await prisma.article.findUnique({
        where: { slug },
      })
      if (slugConflict) {
        return NextResponse.json(
          { error: 'Slug already exists' },
          { status: 409 }
        )
      }
    }

    // Calculate read time
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length
    const readTime = Math.ceil(wordCount / 200)

    if (featured) {
      await prisma.article.updateMany({ data: { featured: false }, where: { featured: true, NOT: { id } } })
    }

    // Handle scheduling: if scheduledAt is provided, don't auto-publish
    const scheduledDate = scheduledAt ? new Date(scheduledAt) : null
    const shouldPublish = published && !scheduledDate
    
    const article = await prisma.article.update({
      where: { id },
      data: {
        title,
        slug,
        excerpt,
        content,
        featuredImage,
        categoryId,
        editorId,
        published: shouldPublish,
        publishedAt: shouldPublish ? (existingArticle.publishedAt || new Date()) : null,
        scheduledAt: scheduledDate,
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

    return NextResponse.json({ article })
  } catch (error) {
    console.error('Update article error:', error)
    return NextResponse.json(
      { error: 'Failed to update article' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    await prisma.article.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete article' },
      { status: 500 }
    )
  }
}


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
      metaTitle,
      metaDescription,
      featured,
    } = body

    // Calculate read time
    const wordCount = content.replace(/<[^>]*>/g, '').split(/\s+/).length
    const readTime = Math.ceil(wordCount / 200)

    if (featured) {
      await prisma.article.updateMany({ data: { featured: false }, where: { featured: true, NOT: { id } } })
    }

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

    return NextResponse.json({ article })
  } catch (_error) {
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


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const page = await prisma.staticPage.findUnique({
      where: { slug },
    })

    if (!page) {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }

    return NextResponse.json(page)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch static page' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug: currentSlug } = await params
    const body = await request.json()
    const { title, slug, content, metaTitle, metaDescription } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 })
    }

    // Check if slug is being changed and if new slug already exists
    if (slug !== currentSlug) {
      const existingPage = await prisma.staticPage.findUnique({
        where: { slug },
      })
      if (existingPage) {
        return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 400 })
      }
    }

    const page = await prisma.staticPage.update({
      where: { slug: currentSlug },
      data: {
        title,
        slug,
        content,
        metaTitle,
        metaDescription,
      },
    })

    return NextResponse.json(page)
  } catch (e: any) {
    if (e.code === 'P2025') {
      return NextResponse.json({ error: 'Page not found' }, { status: 404 })
    }
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to update static page' }, { status: 500 })
  }
}


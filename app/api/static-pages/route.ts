import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const pages = await prisma.staticPage.findMany({
      orderBy: { title: 'asc' },
    })
    return NextResponse.json(pages)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to fetch static pages' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, slug, content, metaTitle, metaDescription } = body

    if (!title || !slug || !content) {
      return NextResponse.json({ error: 'Title, slug, and content are required' }, { status: 400 })
    }

    const page = await prisma.staticPage.create({
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
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'A page with this slug already exists' }, { status: 400 })
    }
    return NextResponse.json({ error: 'Failed to create static page' }, { status: 500 })
  }
}








import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const query = searchParams.get('q') || ''

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ articles: [] })
    }

    const searchTerm = query.trim()

    // Search in title, excerpt, and content
    // SQLite doesn't support case-insensitive mode, but LIKE is case-insensitive by default
    const articles = await prisma.article.findMany({
      where: {
        published: true,
        OR: [
          { title: { contains: searchTerm } },
          { excerpt: { contains: searchTerm } },
          { content: { contains: searchTerm } },
        ],
      },
      include: {
        category: true,
        editor: true,
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
    })

    return NextResponse.json({ articles })
  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Failed to search articles' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/session'
import { getRecommendations } from '@/lib/recommendations'
import { prisma } from '@/lib/prisma'
import { cookies } from 'next/headers'

async function getAnonymousId(): Promise<string | null> {
  const cookieStore = await cookies()
  return cookieStore.get('anonymous-id')?.value || null
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const anonymousId = await getAnonymousId()

    // Get recommended article IDs
    const recommendedIds = await getRecommendations(
      user?.id || null,
      anonymousId,
      8
    )

    if (recommendedIds.length === 0) {
      // Fallback to trending articles if no recommendations
      const trendingArticles = await prisma.article.findMany({
        where: { published: true },
        orderBy: { views: 'desc' },
        take: 8,
        include: {
          category: true,
          editor: true,
          featuredImageMedia: {
            select: { id: true },
          },
        },
      })

      return NextResponse.json({
        articles: trendingArticles,
        isRecommended: false,
      })
    }

    // Fetch full article data
    const articles = await prisma.article.findMany({
      where: {
        id: { in: recommendedIds },
        published: true,
      },
      include: {
        category: true,
        editor: true,
        featuredImageMedia: {
          select: { id: true },
        },
      },
    })

    // Sort articles to match recommendation order
    const sortedArticles = recommendedIds
      .map((id) => articles.find((a) => a.id === id))
      .filter((a): a is NonNullable<typeof a> => a !== undefined)

    return NextResponse.json({
      articles: sortedArticles,
      isRecommended: true,
    })
  } catch (error) {
    console.error('Error fetching recommendations:', error)
    
    // Fallback to trending articles on error
    try {
      const trendingArticles = await prisma.article.findMany({
        where: { published: true },
        orderBy: { views: 'desc' },
        take: 8,
        include: {
          category: true,
          editor: true,
          featuredImageMedia: {
            select: { id: true },
          },
        },
      })

      return NextResponse.json({
        articles: trendingArticles,
        isRecommended: false,
      })
    } catch (fallbackError) {
      return NextResponse.json(
        { error: 'Failed to fetch recommendations' },
        { status: 500 }
      )
    }
  }
}


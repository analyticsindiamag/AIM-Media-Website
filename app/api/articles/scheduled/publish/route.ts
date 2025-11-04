import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// This endpoint should be called periodically (e.g., via cron job)
// to publish articles that have reached their scheduledAt time
export async function POST() {
  try {
    const now = new Date()
    
    // Find articles that are scheduled and should be published
    const scheduledArticles = await prisma.article.findMany({
      where: {
        scheduledAt: {
          lte: now, // scheduledAt is less than or equal to now
        },
        published: false,
      },
    })

    if (scheduledArticles.length === 0) {
      return NextResponse.json({ 
        message: 'No articles to publish',
        published: 0 
      })
    }

    // Publish all scheduled articles
    const updatePromises = scheduledArticles.map((article) =>
      prisma.article.update({
        where: { id: article.id },
        data: {
          published: true,
          publishedAt: article.scheduledAt || new Date(),
          scheduledAt: null, // Clear scheduledAt after publishing
        },
      })
    )

    await Promise.all(updatePromises)

    return NextResponse.json({ 
      message: `Published ${scheduledArticles.length} article(s)`,
      published: scheduledArticles.length,
      articles: scheduledArticles.map(a => ({ id: a.id, title: a.title }))
    })
  } catch (error) {
    console.error('Error publishing scheduled articles:', error)
    return NextResponse.json(
      { error: 'Failed to publish scheduled articles' },
      { status: 500 }
    )
  }
}

// GET endpoint to check scheduled articles (for testing)
export async function GET() {
  try {
    const now = new Date()
    
    const scheduledArticles = await prisma.article.findMany({
      where: {
        scheduledAt: {
          lte: now,
        },
        published: false,
      },
      select: {
        id: true,
        title: true,
        scheduledAt: true,
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    })

    return NextResponse.json({ 
      count: scheduledArticles.length,
      articles: scheduledArticles 
    })
  } catch (error) {
    console.error('Error fetching scheduled articles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch scheduled articles' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const user = await getCurrentUser()

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, likesCount: true },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    let isLiked = false
    if (user) {
      const like = await prisma.like.findUnique({
        where: {
          userId_articleId: {
            userId: user.id,
            articleId: article.id,
          },
        },
      })
      isLiked = !!like
    }

    return NextResponse.json({
      likesCount: article.likesCount,
      isLiked,
    })
  } catch (error) {
    console.error('Error fetching like status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch like status' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { slug } = await params

    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true, likesCount: true },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check if user already liked
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId: article.id,
        },
      },
    })

    if (existingLike) {
      // Unlike: delete the like
      await prisma.like.delete({
        where: {
          userId_articleId: {
            userId: user.id,
            articleId: article.id,
          },
        },
      })

      // Decrement likes count
      await prisma.article.update({
        where: { id: article.id },
        data: { likesCount: { decrement: 1 } },
      })

      return NextResponse.json({ liked: false, likesCount: article.likesCount - 1 })
    } else {
      // Like: create the like
      await prisma.like.create({
        data: {
          userId: user.id,
          articleId: article.id,
        },
      })

      // Increment likes count
      await prisma.article.update({
        where: { id: article.id },
        data: { likesCount: { increment: 1 } },
      })

      return NextResponse.json({ liked: true, likesCount: article.likesCount + 1 })
    }
  } catch (error) {
    console.error('Error toggling like:', error)
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    )
  }
}

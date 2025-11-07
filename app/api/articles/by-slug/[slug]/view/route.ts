import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getCurrentUser } from '@/lib/session'
import { cookies } from 'next/headers'

// Generate or get anonymous ID from cookie
async function getAnonymousId(request: NextRequest): Promise<string> {
  const cookieStore = await cookies()
  let anonymousId = cookieStore.get('anonymous-id')?.value

  if (!anonymousId) {
    anonymousId = `anon_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`
    cookieStore.set('anonymous-id', anonymousId, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 365, // 1 year
    })
  }

  return anonymousId
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params
    const user = await getCurrentUser()
    const anonymousId = await getAnonymousId(request)

    // Find article
    const article = await prisma.article.findUnique({
      where: { slug },
      select: { id: true },
    })

    if (!article) {
      return NextResponse.json({ error: 'Article not found' }, { status: 404 })
    }

    // Check if view already exists (prevent duplicate views in short time)
    const recentView = await prisma.articleView.findFirst({
      where: {
        articleId: article.id,
        ...(user
          ? { userId: user.id }
          : { anonymousId }),
        viewedAt: {
          gte: new Date(Date.now() - 60 * 60 * 1000), // Within last hour
        },
      },
    })

    if (recentView) {
      return NextResponse.json({ success: true, message: 'View already recorded' })
    }

    // Create view record
    await prisma.articleView.create({
      data: {
        articleId: article.id,
        userId: user?.id || null,
        anonymousId: user ? null : anonymousId,
      },
    })

    // Increment article views count
    await prisma.article.update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error tracking article view:', error)
    return NextResponse.json(
      { error: 'Failed to track view' },
      { status: 500 }
    )
  }
}

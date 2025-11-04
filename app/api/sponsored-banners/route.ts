import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type') // 'homepage-main' | 'homepage-side' | 'article-side'
    const activeOnly = searchParams.get('active') !== 'false'

    const now = new Date()
    
    const where: any = {}
    if (type) {
      where.type = type
    }
    if (activeOnly) {
      where.active = true
      where.OR = [
        { startDate: null },
        { startDate: { lte: now } }
      ]
      where.AND = [
        { OR: [{ endDate: null }, { endDate: { gte: now } }] }
      ]
    }

    const banners = await prisma.sponsoredBanner.findMany({
      where,
      orderBy: [
        { displayOrder: 'asc' },
        { createdAt: 'desc' }
      ],
    })

    return NextResponse.json(banners)
  } catch (error) {
    console.error('Error fetching banners:', error)
    return NextResponse.json(
      { error: 'Failed to fetch banners' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, imageUrl, linkUrl, type, active, startDate, endDate, displayOrder } = body

    if (!title || !imageUrl || !type) {
      return NextResponse.json(
        { error: 'Missing required fields: title, imageUrl, type' },
        { status: 400 }
      )
    }

    if (!['homepage-main', 'homepage-side', 'article-side'].includes(type)) {
      return NextResponse.json(
        { error: 'Invalid type. Must be: homepage-main, homepage-side, or article-side' },
        { status: 400 }
      )
    }

    const banner = await prisma.sponsoredBanner.create({
      data: {
        title,
        imageUrl,
        linkUrl: linkUrl || null,
        type,
        active: active !== undefined ? active : true,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        displayOrder: displayOrder || 0,
      },
    })

    return NextResponse.json(banner, { status: 201 })
  } catch (error) {
    console.error('Error creating banner:', error)
    return NextResponse.json(
      { error: 'Failed to create banner' },
      { status: 500 }
    )
  }
}


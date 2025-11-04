import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      orderBy: [
        { order: 'asc' },
        { name: 'asc' }, // Fallback to name if order is same
      ],
    })

    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, slug, description, bannerImage, order } = body

    // If no order specified, set it to the max order + 1
    let finalOrder = order
    if (finalOrder === undefined || finalOrder === null) {
      const maxOrderCategory = await prisma.category.findFirst({
        orderBy: { order: 'desc' },
        select: { order: true },
      })
      finalOrder = (maxOrderCategory?.order ?? -1) + 1
    }

    const category = await prisma.category.create({
      data: {
        name,
        slug,
        description,
        bannerImage,
        order: finalOrder,
      },
    })

    return NextResponse.json({ category })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { id, order, bannerImage, name, slug, description } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing id' },
        { status: 400 }
      )
    }

    // Build update data object with only provided fields
    const updateData: {
      order?: number
      bannerImage?: string | null
      name?: string
      slug?: string
      description?: string | null
    } = {}

    if (order !== undefined) updateData.order = order
    if (bannerImage !== undefined) updateData.bannerImage = bannerImage || null
    if (name !== undefined) updateData.name = name
    if (slug !== undefined) updateData.slug = slug
    if (description !== undefined) updateData.description = description || null

    const category = await prisma.category.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ category })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    await prisma.category.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 }
    )
  }
}


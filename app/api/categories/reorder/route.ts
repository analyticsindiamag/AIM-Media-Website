import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { categories } = body // Array of { id, order }

    if (!Array.isArray(categories)) {
      return NextResponse.json(
        { error: 'categories must be an array' },
        { status: 400 }
      )
    }

    // Update all categories in a transaction
    await prisma.$transaction(
      categories.map((cat: { id: string; order: number }) =>
        prisma.category.update({
          where: { id: cat.id },
          data: { order: cat.order },
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reorder error:', error)
    return NextResponse.json(
      { error: 'Failed to reorder categories' },
      { status: 500 }
    )
  }
}


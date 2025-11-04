import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const editors = await prisma.editor.findMany({
      orderBy: { name: 'asc' },
    })

    return NextResponse.json(editors)
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to fetch editors' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, bio, avatar } = body

    // Generate slug from name
    const slug = name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')

    // Ensure unique slug
    let uniqueSlug = slug
    let counter = 1
    while (await prisma.editor.findUnique({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`
      counter++
    }

    const editor = await prisma.editor.create({
      data: {
        name,
        email,
        slug: uniqueSlug,
        bio,
        avatar,
      },
    })

    return NextResponse.json({ editor })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to create editor' },
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
    await prisma.editor.delete({ where: { id } })
    return NextResponse.json({ ok: true })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Failed to delete editor' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const body = await request.json()
    const { name, email, bio, avatar } = body

    // Check if editor exists
    const existingEditor = await prisma.editor.findUnique({ where: { id } })
    if (!existingEditor) {
      return NextResponse.json({ error: 'Editor not found' }, { status: 404 })
    }

    // If name changed, update slug
    let slug = existingEditor.slug
    if (name && name !== existingEditor.name) {
      slug = name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '')
      
      // Ensure unique slug
      let uniqueSlug = slug
      let counter = 1
      while (await prisma.editor.findUnique({ where: { slug: uniqueSlug, NOT: { id } } })) {
        uniqueSlug = `${slug}-${counter}`
        counter++
      }
      slug = uniqueSlug
    }

    // Check email uniqueness if changed
    if (email && email !== existingEditor.email) {
      const emailExists = await prisma.editor.findUnique({ where: { email } })
      if (emailExists) {
        return NextResponse.json({ error: 'Email already exists' }, { status: 409 })
      }
    }

    const editor = await prisma.editor.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(bio !== undefined && { bio }),
        ...(avatar !== undefined && { avatar }),
        ...(slug !== existingEditor.slug && { slug }),
      },
    })

    return NextResponse.json({ editor })
  } catch (error) {
    console.error('Update editor error:', error)
    return NextResponse.json(
      { error: 'Failed to update editor' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/media - List all media items (paginated, with search)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // SQLite doesn't support case-insensitive mode, so we'll do case-sensitive search
    // For case-insensitive search, convert search term to lowercase and use Prisma's raw query if needed
    const where = search
      ? {
          OR: [
            { filename: { contains: search } },
            { title: { contains: search } },
            { altText: { contains: search } },
          ],
        }
      : {}

    const [media, total] = await Promise.all([
      prisma.media.findMany({
        where,
        select: {
          id: true,
          filename: true,
          mimeType: true,
          size: true,
          altText: true,
          title: true,
          caption: true,
          createdAt: true,
          updatedAt: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.media.count({ where }),
    ])

    return NextResponse.json({
      media,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Failed to fetch media:', error)
    return NextResponse.json(
      { error: 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

// POST /api/media - Upload new image (store in DB as BLOB)
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'File must be an image' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'Image size must be less than 10MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Get optional metadata
    const altText = formData.get('altText') as string | null
    const title = formData.get('title') as string | null
    const caption = formData.get('caption') as string | null

    // Create media record
    const media = await prisma.media.create({
      data: {
        filename: file.name,
        mimeType: file.type,
        data: buffer,
        size: file.size,
        altText: altText || null,
        title: title || null,
        caption: caption || null,
      },
      select: {
        id: true,
        filename: true,
        mimeType: true,
        size: true,
        altText: true,
        title: true,
        caption: true,
        createdAt: true,
        updatedAt: true,
      },
    })

    return NextResponse.json({ media }, { status: 201 })
  } catch (error) {
    console.error('Failed to upload media:', error)
    return NextResponse.json(
      { error: 'Failed to upload media' },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/media/[id] - Serve image binary data
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params
    const media = await prisma.media.findUnique({
      where: { id },
      select: {
        data: true,
        mimeType: true,
        filename: true,
      },
    })

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    // Convert Buffer to ArrayBuffer for Response
    const buffer = Buffer.from(media.data)
    const arrayBuffer = buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength
    )

    // Return image with proper Content-Type header
    return new NextResponse(arrayBuffer, {
      headers: {
        'Content-Type': media.mimeType,
        'Content-Disposition': `inline; filename="${media.filename}"`,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Failed to serve media:', error)
    return NextResponse.json(
      { error: 'Failed to serve media' },
      { status: 500 }
    )
  }
}

// DELETE /api/media/[id] - Delete media
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params

    // Check if media is being used by any articles
    const articlesUsingMedia = await prisma.article.count({
      where: { featuredImageMediaId: id },
    })

    if (articlesUsingMedia > 0) {
      return NextResponse.json(
        {
          error: `Cannot delete media: it is being used by ${articlesUsingMedia} article(s)`,
        },
        { status: 409 }
      )
    }

    await prisma.media.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete media:', error)
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    )
  }
}

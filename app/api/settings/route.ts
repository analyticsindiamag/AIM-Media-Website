import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

async function getOrCreate() {
  let s = await prisma.settings.findUnique({ where: { id: 'default' } })
  if (!s) {
    s = await prisma.settings.create({ data: { id: 'default' } })
  }
  return s
}

export async function GET() {
  const s = await getOrCreate()
  return NextResponse.json(s)
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      siteName, 
      logoUrl, 
      navLinksJson, 
      footerLinksJson, 
      subscribeCta,
      headerBarLeftText,
      headerBarLeftLink,
      headerBarRightText,
      headerBarRightLink
    } = body
    const s = await prisma.settings.update({
      where: { id: 'default' },
      data: { 
        siteName, 
        logoUrl, 
        navLinksJson, 
        footerLinksJson, 
        subscribeCta,
        headerBarLeftText,
        headerBarLeftLink,
        headerBarRightText,
        headerBarRightLink
      },
    })
    return NextResponse.json(s)
  } catch (e) {
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}

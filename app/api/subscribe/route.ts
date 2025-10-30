import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return NextResponse.json({ error: 'Invalid email' }, { status: 400 })
    }

    const existing = await prisma.subscriber.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ success: true })
    }

    await prisma.subscriber.create({ data: { email } })
    return NextResponse.json({ success: true })
  } catch (_e) {
    return NextResponse.json({ error: 'Failed to subscribe' }, { status: 500 })
  }
}

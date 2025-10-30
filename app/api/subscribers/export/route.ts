import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const subscribers = await prisma.subscriber.findMany({ orderBy: { createdAt: 'desc' } })
  const header = 'email,createdAt\n'
  const rows = subscribers.map((s) => `${s.email},${s.createdAt.toISOString()}`).join('\n')
  const csv = header + rows + (rows ? '\n' : '')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': 'attachment; filename="subscribers.csv"',
      'Cache-Control': 'no-store',
    },
  })
}

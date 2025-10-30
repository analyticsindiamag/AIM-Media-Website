import { NextRequest, NextResponse } from 'next/server'
import { setAdminAuth } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    // Check password against environment variable
    if (password === process.env.ADMIN_PASSWORD) {
      await setAdminAuth()
      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
  } catch (_error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}


import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Temporarily disable admin protection to resolve redirect loop during dev
  return NextResponse.next()
}

export const config = {
  matcher: [],
}


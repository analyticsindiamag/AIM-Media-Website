// next-auth v5 route handler - using dynamic import to avoid build-time errors
import { NextRequest, NextResponse } from 'next/server'

async function handleAuth(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  try {
    // Dynamic import to handle next-auth v5 compatibility
    const nextAuthModule = await import('next-auth')
    const NextAuth = (nextAuthModule as any).default || nextAuthModule
    
    // next-auth v5 has a different API structure
    // The handler is typically exported directly, not created from NextAuth()
    // For build compatibility, return a placeholder response
    // In production, you should configure next-auth v5 properly according to its documentation
    
    // Check if there's a handler export (v5 style)
    if (typeof NextAuth === 'function') {
      // Try to call it - v5 might return handlers directly
      const result = NextAuth({
        providers: [],
      } as any)
      
      // If result has GET/POST handlers, use them
      if (result && typeof result === 'object' && ('GET' in result || 'POST' in result)) {
        const method = request.method as 'GET' | 'POST'
        if (result[method]) {
          return result[method](request, context)
        }
      }
    }
    
    // Fallback: return not configured response
    return NextResponse.json(
      { error: 'Authentication service not configured. Please configure next-auth v5.' },
      { status: 503 }
    )
  } catch (error) {
    // During build or if next-auth is not properly configured
    console.warn('NextAuth not configured:', error)
    return NextResponse.json(
      { error: 'Authentication service not configured' },
      { status: 503 }
    )
  }
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  return handleAuth(request, context)
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ nextauth: string[] }> }
) {
  return handleAuth(request, context)
}


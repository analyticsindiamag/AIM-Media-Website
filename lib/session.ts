// Note: next-auth v5 beta API compatibility - avoiding direct imports at build time
import { prisma } from '@/lib/prisma'

// Auth options placeholder - actual config should be in auth.ts for next-auth v5
export const authOptions = {
  // Configuration moved to auth.ts or handled by next-auth v5
}

// Dynamic import helper to avoid build-time errors
async function getAuthFunction() {
  try {
    // Dynamic import to avoid build-time errors with next-auth v5
    const nextAuth = await import('next-auth') as any
    // Check for v5 auth function
    if (typeof nextAuth.auth === 'function') {
      return nextAuth.auth
    }
    // Fallback for v4 if needed
    if (typeof nextAuth.getServerSession === 'function') {
      return () => nextAuth.getServerSession({})
    }
  } catch {
    // next-auth not available or incompatible version
  }
  return null
}

export async function getCurrentUser() {
  try {
    const authFn = await getAuthFunction()
    if (!authFn) {
      return null
    }
    
    const session = await authFn()
    
    if (!session?.user?.email) {
      return null
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        googleId: true,
      },
    })

    return user
  } catch (error) {
    // During build or if auth is not configured, return null
    return null
  }
}

export async function getSession() {
  try {
    const authFn = await getAuthFunction()
    if (!authFn) {
      return null
    }
    return await authFn()
  } catch (error) {
    return null
  }
}


// Note: next-auth v5 beta API compatibility - avoiding direct imports at build time
import { prisma } from '@/lib/prisma'

// Auth options placeholder - actual config should be in auth.ts for next-auth v5
export const authOptions = {
  // Configuration moved to auth.ts or handled by next-auth v5
}

// Dynamic import helper to avoid build-time errors
async function getAuthFunction() {
  try {
    // Import auth from auth.ts (NextAuth v5)
    const { auth } = await import('@/auth')
    return auth
  } catch (error) {
    // Auth not available or not configured
    console.warn('Auth not available:', error)
    return null
  }
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
    console.warn('Error getting current user:', error)
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
    console.warn('Error getting session:', error)
    return null
  }
}


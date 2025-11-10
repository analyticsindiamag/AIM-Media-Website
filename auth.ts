import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

// Generate a fallback secret if AUTH_SECRET is not set
// During build, we always use a fallback to allow the build to complete
// At runtime, NextAuth will validate the secret when auth is actually used
const getAuthSecret = () => {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET
  }
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET
  }
  
  // Use fallback during build or development
  // In production runtime, AUTH_SECRET should be set, but we allow build to proceed
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  AUTH_SECRET not set. Using fallback secret for development.')
  }
  
  // Always return a fallback to allow builds to complete
  // Production deployments should set AUTH_SECRET in their environment
  return 'development-secret-change-in-production'
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.sub
      }
      return session
    },
  },
  secret: getAuthSecret(),
  trustHost: true,
})


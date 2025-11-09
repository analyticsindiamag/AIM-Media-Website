import NextAuth from "next-auth"
import Google from "next-auth/providers/google"

// Generate a fallback secret if AUTH_SECRET is not set (for development only)
const getAuthSecret = () => {
  if (process.env.AUTH_SECRET) {
    return process.env.AUTH_SECRET
  }
  if (process.env.NEXTAUTH_SECRET) {
    return process.env.NEXTAUTH_SECRET
  }
  // Fallback for development - in production, AUTH_SECRET must be set
  if (process.env.NODE_ENV === 'development') {
    console.warn('⚠️  AUTH_SECRET not set. Using fallback secret for development.')
    return 'development-secret-change-in-production'
  }
  throw new Error('AUTH_SECRET is required in production')
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


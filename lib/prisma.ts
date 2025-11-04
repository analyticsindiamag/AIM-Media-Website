import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Ensure we're using SQLite (not Accelerate/Data Proxy)
// SQLite URLs should start with "file:" not "prisma://" or "prisma+"
const databaseUrl = process.env.DATABASE_URL || ''
if (databaseUrl && !databaseUrl.startsWith('file:')) {
  console.warn(`Warning: DATABASE_URL should start with "file:" for SQLite. Current value: ${databaseUrl.substring(0, 50)}...`)
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma


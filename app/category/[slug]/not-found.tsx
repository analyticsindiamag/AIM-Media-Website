import Link from 'next/link'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'

export const metadata: Metadata = {
  title: 'Category Not Found',
  description: 'The category you are looking for does not exist.',
  robots: {
    index: false,
    follow: true,
  },
}

export default async function NotFound() {
  // Fetch all categories for navigation
  const categories = await prisma.category.findMany({
    orderBy: { name: 'asc' },
    select: {
      name: true,
      slug: true,
      description: true,
    },
  }).catch(() => [])

  return (
    <div className="bg-white min-h-screen">
      <div className="wsj-container py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4 text-[var(--wsj-text-black)]">
            Category Not Found
          </h1>
          <p className="text-[var(--wsj-font-size-lg)] text-[var(--wsj-text-dark-gray)] mb-8 font-serif">
            The category you&apos;re looking for doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="inline-block bg-[var(--wsj-blue-primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--wsj-blue-primary)]/90 transition-colors font-sans"
          >
            Back to Home
          </Link>
        </div>

        {/* All Categories Section */}
        {categories.length > 0 && (
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="font-serif font-bold text-2xl mb-6 text-[var(--wsj-text-black)]">
              Browse All Categories
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="block p-4 border border-[var(--wsj-border-light)] rounded-lg hover:bg-[var(--wsj-bg-light-gray)] transition-colors"
                >
                  <h3 className="font-serif font-bold text-lg text-[var(--wsj-text-black)] hover:underline mb-2">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-dark-gray)] line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


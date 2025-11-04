import Link from 'next/link'
import { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { getArticleUrl } from '@/lib/article-url'

export const metadata: Metadata = {
  title: 'Article Not Found',
  description: 'The article you are looking for does not exist or has been removed.',
  robots: {
    index: false,
    follow: true,
  },
}

export default async function NotFound() {
  // Fetch popular articles for suggestions
  const popularArticles = await prisma.article.findMany({
    where: { published: true },
    orderBy: { views: 'desc' },
    take: 5,
    include: {
      category: {
        select: {
          slug: true,
        },
      },
    },
    select: {
      title: true,
      slug: true,
      excerpt: true,
      category: {
        select: {
          slug: true,
        },
      },
    },
  }).catch(() => [])

  // Fetch categories for navigation
  const categories = await prisma.category.findMany({
    take: 6,
    orderBy: [
      { order: 'asc' },
      { name: 'asc' },
    ],
    select: {
      name: true,
      slug: true,
    },
  }).catch(() => [])

  return (
    <div className="bg-white min-h-screen">
      <div className="wsj-container py-12 md:py-20">
        <div className="max-w-2xl mx-auto text-center mb-12">
          <h1 className="font-serif font-bold text-4xl md:text-5xl mb-4 text-[var(--wsj-text-black)]">
            Article Not Found
          </h1>
          <p className="text-[var(--wsj-font-size-lg)] text-[var(--wsj-text-dark-gray)] mb-8 font-serif">
            The article you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Link
            href="/"
            className="inline-block bg-[var(--wsj-blue-primary)] text-white px-6 py-3 rounded-lg hover:bg-[var(--wsj-blue-primary)]/90 transition-colors font-sans"
          >
            Back to Home
          </Link>
        </div>

        {/* Popular Articles Section */}
        {popularArticles.length > 0 && (
          <div className="max-w-4xl mx-auto mt-16">
            <h2 className="font-serif font-bold text-2xl mb-6 text-[var(--wsj-text-black)]">
              Popular Articles
            </h2>
            <div className="space-y-4">
              {popularArticles.map((article) => {
                const articleUrl = getArticleUrl(article)
                return (
                <Link
                  key={article.slug}
                  href={articleUrl}
                  className="block p-4 border border-[var(--wsj-border-light)] rounded-lg hover:bg-[var(--wsj-bg-light-gray)] transition-colors"
                >
                  <h3 className="font-serif font-bold text-lg text-[var(--wsj-text-black)] hover:underline mb-2">
                    {article.title}
                  </h3>
                  {article.excerpt && (
                    <p className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-dark-gray)] line-clamp-2">
                      {article.excerpt}
                    </p>
                  )}
                </Link>
                )
              })}
            </div>
          </div>
        )}

        {/* Categories Navigation */}
        {categories.length > 0 && (
          <div className="max-w-4xl mx-auto mt-12">
            <h2 className="font-serif font-bold text-2xl mb-6 text-[var(--wsj-text-black)]">
              Browse Categories
            </h2>
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((category) => (
                <Link
                  key={category.slug}
                  href={`/category/${category.slug}`}
                  className="px-4 py-2 border border-[var(--wsj-border-light)] rounded-lg hover:bg-[var(--wsj-bg-light-gray)] transition-colors font-sans text-[var(--wsj-text-black)]"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}


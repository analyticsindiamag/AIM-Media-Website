import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { MessageCircle, Clock } from 'lucide-react'

// Revalidate every 60 seconds
export const revalidate = 60

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default async function HomePage() {
  // Fetch articles for WSJ-style layout
  const [centerArticle, allArticles] = await Promise.all([
    // Center: Featured large image article
    (async () => {
      const featured = await prisma.article.findFirst({
        where: { published: true, featured: true },
        orderBy: { publishedAt: 'desc' },
        include: { category: true, editor: true },
      })
      if (featured) return featured
      return prisma.article.findFirst({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        include: { category: true, editor: true },
      })
    })(),
    // Get all articles for left and right columns
    prisma.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      include: { category: true, editor: true },
    }),
  ])

  // Filter out center article from other columns
  const articlesWithoutCenter = allArticles.filter(
    (article) => centerArticle && article.id !== centerArticle.id
  )

  const leftColumnArticles = articlesWithoutCenter.slice(0, 6)
  const opinionArticles = articlesWithoutCenter.filter(a => a.category.slug === 'opinion').slice(0, 5)
  const otherRightArticles = articlesWithoutCenter.filter(a => a.category.slug !== 'opinion').slice(6, 10)

  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  return (
    <div className="bg-white min-h-screen">
      <div className="wsj-container py-6 md:py-8">
        {/* Date */}
        <div className="mb-6 pb-4 border-b border-[var(--wsj-border-light)]">
          <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
            {today}
          </div>
        </div>

        {/* Three Column Layout - WSJ Style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Main Articles List */}
          <div className="lg:col-span-4 space-y-6">
            {leftColumnArticles.map((article, index) => (
              <article key={article.id} className="group">
                <Link href={`/article/${article.slug}`} className="block">
                  <h2 className="font-serif font-bold text-[22px] md:text-[24px] leading-[var(--wsj-line-height-normal)] mb-2 text-[var(--wsj-text-black)] group-hover:underline">
                    {article.title}
                  </h2>
                  {article.excerpt && (
                    <p className="text-[var(--wsj-font-size-md)] text-[var(--wsj-text-dark-gray)] mb-3 line-clamp-2 font-serif leading-[var(--wsj-line-height-loose)]">
                      {article.excerpt}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
                    <div className="flex items-center gap-1">
                      <MessageCircle className="w-3 h-3" />
                      <span>0</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{article.readTime} min read</span>
                    </div>
                  </div>
                </Link>
                {index < leftColumnArticles.length - 1 && (
                  <div className="mt-6 pt-6 border-t border-[var(--wsj-border-light)]" />
                )}
              </article>
            ))}
          </div>

          {/* Center Column - Large Featured Image */}
          <div className="lg:col-span-5">
            {centerArticle && (
              <div className="group">
                <Link href={`/article/${centerArticle.slug}`} className="block">
                  {centerArticle.featuredImage && (
                    <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden mb-4">
                      <Image
                        src={centerArticle.featuredImage}
                        alt={centerArticle.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 42vw"
                      />
                    </div>
                  )}
                  <h2 className="font-serif font-bold text-[28px] md:text-[32px] lg:text-[36px] leading-[var(--wsj-line-height-normal)] mb-3 text-[var(--wsj-text-black)] group-hover:underline">
                    {centerArticle.title}
                  </h2>
                  {centerArticle.excerpt && (
                    <p className="text-[var(--wsj-font-size-md)] text-[var(--wsj-text-dark-gray)] mb-3 font-serif leading-[var(--wsj-line-height-loose)]">
                      {centerArticle.excerpt}
                    </p>
                  )}
                </Link>
                <div className="flex items-center gap-4 text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3 h-3" />
                    <span>0</span>
                  </div>
                  <span className="font-serif italic">Long read</span>
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Opinion Section */}
          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-[var(--wsj-border-light)] pt-6 lg:pt-0 lg:pl-6">
            {/* Opinion Section */}
            {opinionArticles.length > 0 && (
              <div className="mb-8">
                <h3 className="font-serif font-bold text-[var(--wsj-font-size-2xl)] mb-4 text-[var(--wsj-text-black)]">Opinion</h3>
                <div className="space-y-6">
                  {opinionArticles.slice(0, 3).map((article, idx) => (
                    <article key={article.id} className="group">
                      <Link href={`/article/${article.slug}`} className="block">
                        {article.featuredImage && (
                          <div className="relative w-full h-[120px] overflow-hidden mb-3">
                            <Image
                              src={article.featuredImage}
                              alt={article.title}
                              fill
                              loading="lazy"
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 25vw"
                            />
                          </div>
                        )}
                        <h4 className="font-serif font-bold text-[var(--wsj-font-size-base)] leading-[var(--wsj-line-height-relaxed)] text-[var(--wsj-text-black)] group-hover:underline mb-1">
                          {article.title}
                        </h4>
                        <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
                          By <Link href={`/editor/${article.editor.slug}`} className="hover:underline">{article.editor.name}</Link>
                        </div>
                      </Link>
                      {idx < opinionArticles.slice(0, 3).length - 1 && (
                        <div className="mt-6 pt-6 border-t border-[var(--wsj-border-light)]" />
                      )}
                    </article>
                  ))}
                </div>
              </div>
            )}

            {/* Other Articles */}
            {otherRightArticles.length > 0 && (
              <div className="space-y-6">
                {otherRightArticles.slice(0, 3).map((article, idx) => (
                  <article key={article.id} className="group">
                    <Link href={`/article/${article.slug}`} className="block">
                      {article.featuredImage && (
                        <div className="relative w-full h-[120px] overflow-hidden mb-3">
                          <Image
                            src={article.featuredImage}
                            alt={article.title}
                            fill
                            loading="lazy"
                            className="object-cover"
                            sizes="(max-width: 1024px) 100vw, 25vw"
                          />
                        </div>
                      )}
                      <h4 className="font-serif font-bold text-[var(--wsj-font-size-base)] leading-[var(--wsj-line-height-relaxed)] text-[var(--wsj-text-black)] group-hover:underline mb-1">
                        {article.title}
                      </h4>
                      <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
                        {article.readTime} min read
                      </div>
                    </Link>
                    {idx < otherRightArticles.slice(0, 3).length - 1 && (
                      <div className="mt-6 pt-6 border-t border-[var(--wsj-border-light)]" />
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

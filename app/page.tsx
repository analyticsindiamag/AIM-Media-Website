import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { MessageCircle, Clock } from 'lucide-react'
import { AdBannerFetcher } from '@/components/ad-banner-fetcher'
import { getArticleUrl } from '@/lib/article-url'

// Revalidate every 60 seconds
export const revalidate = 60

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default async function HomePage() {
  try {
    // Fetch articles for WSJ-style layout
    const [centerArticle, allArticles, categories] = await Promise.all([
      // Center: Featured large image article
      (async () => {
        try {
          const featured = await prisma.article.findFirst({
            where: { 
              published: true, 
              featured: true,
              publishedAt: { not: null }
            },
            orderBy: { publishedAt: 'desc' },
            include: { category: true, editor: true },
          })
          if (featured) return featured
          return prisma.article.findFirst({
            where: { 
              published: true,
              publishedAt: { not: null }
            },
            orderBy: { publishedAt: 'desc' },
            include: { category: true, editor: true },
          })
        } catch (err) {
          console.error('Error fetching featured article:', err)
          return null
        }
      })(),
      // Get all articles for left and right columns
      prisma.article.findMany({
        where: { 
          published: true,
          publishedAt: { not: null }
        },
        orderBy: { publishedAt: 'desc' },
        take: 30,
        include: { category: true, editor: true },
      }),
      // Get categories for horizontal scrolling section
      prisma.category.findMany({
        orderBy: [
          { order: 'asc' },
          { name: 'asc' }, // Fallback to name if order is same
        ],
      }),
    ])

    // Filter out center article from other columns and ensure required relations exist
    const articlesWithoutCenter = (allArticles || []).filter(
      (article) => article && article.category && article.editor && (!centerArticle || article.id !== centerArticle.id)
    )

    // Left column: Main news articles
    const leftColumnArticles = articlesWithoutCenter.slice(0, 8)
    
    // Right column: Trending/Opinion articles
    const trendingArticles = articlesWithoutCenter
      .filter(a => a.category?.slug === 'opinion')
      .slice(0, 6)
    
    // Bottom center: More articles
    const bottomCenterArticles = articlesWithoutCenter.slice(8, 14)

    const today = format(new Date(), 'EEEE, MMMM d, yyyy')
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // ArticleList Schema for Homepage
    const allArticlesForSchema = centerArticle 
      ? [centerArticle, ...articlesWithoutCenter].slice(0, 20)
      : articlesWithoutCenter.slice(0, 20)

    const articleListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Latest Articles',
      description: 'Latest AI and Technology News Articles',
      numberOfItems: allArticlesForSchema.length,
      itemListElement: allArticlesForSchema.map((article, index) => ({
        '@type': 'ListItem',
        position: index + 1,
        item: {
          '@type': 'NewsArticle',
          headline: article.title,
          url: `${baseUrl}/article/${article.slug}`,
          image: article.featuredImage || undefined,
          datePublished: article.publishedAt?.toISOString(),
          author: {
            '@type': 'Person',
            name: article.editor.name,
            url: `${baseUrl}/editor/${article.editor.slug}`,
          },
          publisher: {
            '@type': 'Organization',
            name: 'AI Tech News',
          },
        },
      })),
    }

    // If no articles, show empty state
    if (!centerArticle && articlesWithoutCenter.length === 0) {
      return (
        <div className="bg-white min-h-screen">
          <div className="wsj-container py-6 md:py-8">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">No articles published yet</h1>
              <p className="text-gray-600">Check back soon for new content.</p>
            </div>
          </div>
        </div>
      )
    }

    return (
      <>
        {/* ArticleList Schema JSON-LD */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(articleListSchema),
          }}
        />
        <div className="bg-white min-h-screen">
        {/* Main Header Banner - Horizontal */}
        <div className="wsj-container py-4">
          <AdBannerFetcher type="homepage-main" />
        </div>

        <div className="wsj-container py-6 md:py-8">
          {/* Date */}
          <div className="mb-6 pb-4 border-b border-[var(--wsj-border-light)]">
            <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
              {today}
            </div>
          </div>

          {/* Three Column Layout - WSJ Style */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 mb-12">
            {/* Left Column - Main Articles List */}
            <div className="lg:col-span-4 space-y-6">
              {leftColumnArticles.map((article, index) => {
                const articleUrl = getArticleUrl(article)
                return (
                <article key={article.id} className="group">
                  <Link href={articleUrl} className="block">
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
                      {article.publishedAt && (
                        <span>{format(new Date(article.publishedAt), 'MMM d')}</span>
                      )}
                    </div>
                  </Link>
                  {index < leftColumnArticles.length - 1 && (
                    <div className="mt-6 pt-6 border-t border-[var(--wsj-border-light)]" />
                  )}
                </article>
                )
              })}
            </div>

            {/* Center Column - Large Featured Image */}
            <div className="lg:col-span-5">
              {centerArticle && (() => {
                const centerArticleUrl = getArticleUrl(centerArticle)
                return (
                  <div className="group mb-8" key={centerArticle.id}>
                    <Link href={centerArticleUrl} className="block">
                    {centerArticle.featuredImage && (
                      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden mb-4">
                        <Image
                          src={centerArticle.featuredImage}
                          alt={centerArticle.featuredImageAltText || centerArticle.title}
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
                    {centerArticle.publishedAt && (
                      <span>{format(new Date(centerArticle.publishedAt), 'MMM d, yyyy')}</span>
                    )}
                  </div>
                  </div>
                )
              })()}

              {/* Bottom Center Articles */}
              {bottomCenterArticles.length > 0 && (
                <div className="space-y-6 mt-8">
                  {bottomCenterArticles.map((article, index) => {
                    const articleUrl = getArticleUrl(article)
                    return (
                    <article key={article.id} className="group">
                      <Link href={articleUrl} className="block">
                        <div className="flex gap-4">
                          {article.featuredImage && (
                            <div className="relative w-32 h-24 flex-shrink-0 overflow-hidden">
                              <Image
                                src={article.featuredImage}
                                alt={article.featuredImageAltText || article.title}
                                fill
                                className="object-cover"
                                sizes="128px"
                              />
                            </div>
                          )}
                          <div className="flex-1">
                            <h3 className="font-serif font-bold text-[var(--wsj-font-size-base)] leading-[var(--wsj-line-height-relaxed)] text-[var(--wsj-text-black)] group-hover:underline mb-1">
                              {article.title}
                            </h3>
                            <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
                              {article.readTime} min read
                            </div>
                          </div>
                        </div>
                      </Link>
                      {index < bottomCenterArticles.length - 1 && (
                        <div className="mt-6 pt-6 border-t border-[var(--wsj-border-light)]" />
                      )}
                    </article>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Right Column - Trending/Opinion Section */}
            <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-[var(--wsj-border-light)] pt-6 lg:pt-0 lg:pl-6">
              {/* Side Banner - Vertical */}
              <div className="mb-8">
                <AdBannerFetcher type="homepage-side" />
              </div>

              {/* Trending/Opinion Section */}
              {trendingArticles.length > 0 && (
                <div className="mb-8">
                  <h3 className="font-serif font-bold text-[var(--wsj-font-size-2xl)] mb-4 text-[var(--wsj-text-black)]">Trending</h3>
                  <div className="space-y-6">
                    {trendingArticles.map((article, idx) => {
                      const articleUrl = getArticleUrl(article)
                      return (
                      <article key={article.id} className="group">
                        <Link href={articleUrl} className="block">
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
                        </Link>
                        <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
                          By <Link href={`/editor/${article.editor.slug}`} className="hover:underline">{article.editor.name}</Link>
                        </div>
                        {idx < trendingArticles.length - 1 && (
                          <div className="mt-6 pt-6 border-t border-[var(--wsj-border-light)]" />
                        )}
                      </article>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Horizontal Scrolling Categories Section */}
          {categories.length > 0 && (
            <div className="mt-12">
              <h2 className="font-serif font-bold text-[var(--wsj-font-size-3xl)] mb-6 text-[var(--wsj-text-black)]">Explore by Category</h2>
              <div className="space-y-8">
                {categories.map((category) => {
                  const categoryArticles = articlesWithoutCenter
                    .filter(a => a.category?.id === category.id)
                    .slice(0, 10)

                  if (categoryArticles.length === 0) return null

                  return (
                    <div key={category.id} className="border-t border-[var(--wsj-border-light)] pt-6">
                      <div className="flex items-center justify-between mb-4">
                        <Link href={`/category/${category.slug}`}>
                          <h3 className="font-serif font-bold text-[var(--wsj-font-size-2xl)] text-[var(--wsj-text-black)] hover:underline">
                            {category.name}
                          </h3>
                        </Link>
                        <Link 
                          href={`/category/${category.slug}`}
                          className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-blue-primary)] hover:underline font-sans"
                        >
                          View All →
                        </Link>
                      </div>
                      <div className="overflow-x-auto">
                        <div className="flex gap-4 pb-4" style={{ scrollbarWidth: 'thin' }}>
                          {categoryArticles.map((article) => {
                            const articleUrl = getArticleUrl(article)
                            return (
                            <div key={article.id} className="flex-shrink-0 w-[280px] group">
                              <Link href={articleUrl} className="block">
                                {article.featuredImage && (
                                  <div className="relative w-full h-[180px] overflow-hidden mb-3">
                                    <Image
                                      src={article.featuredImage}
                                      alt={article.title}
                                      fill
                                      loading="lazy"
                                      className="object-cover"
                                      sizes="280px"
                                    />
                                  </div>
                                )}
                                <h4 className="font-serif font-bold text-[var(--wsj-font-size-base)] leading-[var(--wsj-line-height-relaxed)] text-[var(--wsj-text-black)] group-hover:underline mb-2">
                                  {article.title}
                                </h4>
                                {article.excerpt && (
                                  <p className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-dark-gray)] line-clamp-2 font-serif mb-2">
                                    {article.excerpt}
                                  </p>
                                )}
                                <div className="text-[var(--wsj-font-size-xs)] text-[var(--wsj-text-medium-gray)] font-sans">
                                  {article.readTime} min read
                                </div>
                              </Link>
                            </div>
                            )
                          })}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </div>
      </>
    )
  } catch (error) {
    console.error('Error loading homepage:', error)
    return (
      <div className="bg-white min-h-screen">
        <div className="wsj-container py-6 md:py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Error loading page</h1>
            <p className="text-gray-600">
              {error instanceof Error ? error.message : 'An unexpected error occurred'}
            </p>
          </div>
        </div>
      </div>
    )
  }
}

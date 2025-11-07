import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
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
    // Fetch articles for new layout
    const [featuredArticle, subFeaturedArticles, latestArticles, popularArticles, exclusiveArticles, categories] = await Promise.all([
      // Featured article (main article in center)
      prisma.article.findFirst({
        where: { 
          published: true, 
          featured: true,
          publishedAt: { not: null }
        },
        orderBy: { publishedAt: 'desc' },
        include: { 
          category: true, 
          editor: true,
          featuredImageMedia: {
            select: { id: true },
          },
        },
      }),
      // Sub-featured articles (2 articles below main featured)
      prisma.article.findMany({
        where: { 
          published: true,
          subFeatured: true,
          publishedAt: { not: null }
        },
        orderBy: { publishedAt: 'desc' },
        take: 2,
        include: { 
          category: true, 
          editor: true,
          featuredImageMedia: {
            select: { id: true },
          },
        },
      }),
      // Latest articles for left column
      prisma.article.findMany({
        where: { 
          published: true,
          featured: false,
          subFeatured: false,
          publishedAt: { not: null }
        },
        orderBy: { publishedAt: 'desc' },
        take: 10,
        include: { 
          category: true, 
          editor: true,
          featuredImageMedia: {
            select: { id: true },
          },
        },
      }),
      // Popular articles (by views) for right column
      prisma.article.findMany({
        where: { 
          published: true,
          publishedAt: { not: null }
        },
        orderBy: { views: 'desc' },
        take: 6,
        include: { 
          category: true, 
          editor: true,
          featuredImageMedia: {
            select: { id: true },
          },
        },
      }),
      // Exclusive articles
      prisma.article.findMany({
        where: { 
          published: true,
          exclusive: true,
          publishedAt: { not: null }
        },
        orderBy: { publishedAt: 'desc' },
        take: 4,
        include: { 
          category: true, 
          editor: true,
          featuredImageMedia: {
            select: { id: true },
          },
        },
      }),
      // Get categories
      prisma.category.findMany({
        orderBy: [
          { order: 'asc' },
          { name: 'asc' },
        ],
      }),
    ])

    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

    // If no featured article, use the first latest
    const mainFeaturedArticle = featuredArticle || latestArticles[0]
    const displayLatestArticles = featuredArticle ? latestArticles : latestArticles.slice(1)

    // ArticleList Schema for Homepage
    const allArticlesForSchema = [mainFeaturedArticle, ...subFeaturedArticles, ...displayLatestArticles]
      .filter(Boolean)
      .slice(0, 20)

    const articleListSchema = {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Latest Articles',
      description: 'Latest AI and Technology News Articles',
      numberOfItems: allArticlesForSchema.length,
      itemListElement: allArticlesForSchema.map((article, index) => {
        const imageUrl = article.featuredImageMediaId
          ? `${baseUrl}/api/media/${article.featuredImageMediaId}`
          : article.featuredImage || undefined
        return {
          '@type': 'ListItem',
          position: index + 1,
          item: {
            '@type': 'NewsArticle',
            headline: article.title,
            url: `${baseUrl}/article/${article.slug}`,
            image: imageUrl,
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
        }
      }),
    }

    // If no articles, show empty state
    if (!mainFeaturedArticle && displayLatestArticles.length === 0) {
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
          <div className="wsj-container py-6 md:py-8">
            {/* Four Column Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 lg:gap-8 mb-12">
              {/* Left Column - Latest Articles (1 column) */}
              <div className="space-y-6">
                <h2 className="font-serif font-bold text-[var(--wsj-font-size-xl)] mb-4 text-[var(--wsj-text-black)]">Latest</h2>
                {displayLatestArticles.slice(0, 8).map((article, index) => {
                  const articleUrl = getArticleUrl(article)
                  return (
                    <article key={article.id} className="group">
                      <Link href={articleUrl} className="block">
                        <h3 className="font-serif font-bold text-[18px] leading-[var(--wsj-line-height-relaxed)] text-[var(--wsj-text-black)] group-hover:underline mb-2">
                          {article.title}
                        </h3>
                        <div className="text-[var(--wsj-font-size-xs)] text-[var(--wsj-text-medium-gray)] font-sans">
                          {article.category.name}
                        </div>
                      </Link>
                      {index < displayLatestArticles.slice(0, 8).length - 1 && (
                        <div className="mt-6 wsj-article-separator" />
                      )}
                    </article>
                  )
                })}
              </div>

              {/* Middle Column - Featured Article (2 columns) */}
              {mainFeaturedArticle && (
                <div className="lg:col-span-2">
                  <div className="group mb-8" key={mainFeaturedArticle.id}>
                    <Link href={getArticleUrl(mainFeaturedArticle)} className="block">
                      {(() => {
                        const featuredImageUrl = mainFeaturedArticle.featuredImageMediaId
                          ? `${baseUrl}/api/media/${mainFeaturedArticle.featuredImageMediaId}`
                          : mainFeaturedArticle.featuredImage || null
                        return featuredImageUrl ? (
                          <div className="relative w-full aspect-[16/10] overflow-hidden mb-4">
                            <Image
                              src={featuredImageUrl}
                              alt={mainFeaturedArticle.featuredImageAltText || mainFeaturedArticle.title}
                              fill
                              priority
                              className="object-cover"
                              sizes="(max-width: 1024px) 100vw, 50vw"
                            />
                          </div>
                        ) : null
                      })()}
                      <h1 className="font-serif font-bold text-[42px] md:text-[48px] leading-[var(--wsj-line-height-tight)] mb-3 text-[var(--wsj-text-black)] group-hover:underline">
                        {mainFeaturedArticle.title}
                      </h1>
                      {mainFeaturedArticle.excerpt && (
                        <p className="text-[20px] text-[var(--wsj-text-dark-gray)] mb-3 font-serif leading-[var(--wsj-line-height-loose)]">
                          {mainFeaturedArticle.excerpt}
                        </p>
                      )}
                    </Link>
                    <div className="flex items-center gap-4 text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
                      <span>{mainFeaturedArticle.category.name}</span>
                      <span>•</span>
                      <span>{mainFeaturedArticle.editor.name}</span>
                    </div>
                  </div>

                  {/* Sub-Featured Articles (2 articles, 1 column each) */}
                  {subFeaturedArticles.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 pt-8 border-t border-[var(--wsj-border-light)]">
                      {subFeaturedArticles.map((article, index) => {
                        const articleUrl = getArticleUrl(article)
                        const articleImageUrl = article.featuredImageMediaId
                          ? `${baseUrl}/api/media/${article.featuredImageMediaId}`
                          : article.featuredImage || null
                        return (
                          <article key={article.id} className="group">
                            <Link href={articleUrl} className="block">
                              {articleImageUrl && (
                                <div className="relative w-full aspect-[16/10] overflow-hidden mb-3">
                                  <Image
                                    src={articleImageUrl}
                                    alt={article.featuredImageAltText || article.title}
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, 25vw"
                                  />
                                </div>
                              )}
                              <h3 className="font-serif font-bold text-[22px] leading-[var(--wsj-line-height-relaxed)] text-[var(--wsj-text-black)] group-hover:underline mb-2">
                                {article.title}
                              </h3>
                              {article.excerpt && (
                                <p className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-dark-gray)] line-clamp-2 font-serif mb-2">
                                  {article.excerpt}
                                </p>
                              )}
                              <div className="text-[var(--wsj-font-size-xs)] text-[var(--wsj-text-medium-gray)] font-sans">
                                {article.category.name}
                              </div>
                            </Link>
                          </article>
                        )
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* Right Column - Most Popular + Advertisement (1 column) */}
              <div className="space-y-8">
                {/* Most Popular Section */}
                {popularArticles.length > 0 && (
                  <div>
                    <h2 className="font-serif font-bold text-[var(--wsj-font-size-xl)] mb-5 text-[var(--wsj-text-black)] pb-3 border-b border-[var(--wsj-border-light)]">Most Popular</h2>
                    <div className="space-y-5">
                      {popularArticles.map((article, idx) => {
                        const articleUrl = getArticleUrl(article)
                        const articleImageUrl = article.featuredImageMediaId
                          ? `${baseUrl}/api/media/${article.featuredImageMediaId}`
                          : article.featuredImage || null
                        return (
                          <article key={article.id} className="group">
                            <div className="flex gap-3 items-start">
                              {articleImageUrl && (
                                <Link href={articleUrl} className="flex-shrink-0">
                                  <div className="relative w-20 h-20 overflow-hidden">
                                    <Image
                                      src={articleImageUrl}
                                      alt={article.title}
                                      fill
                                      loading="lazy"
                                      className="object-cover"
                                      sizes="80px"
                                    />
                                  </div>
                                </Link>
                              )}
                              <div className="flex-1 min-w-0">
                                <Link href={articleUrl}>
                                  <h4 className="font-serif font-bold text-[var(--wsj-font-size-sm)] leading-[var(--wsj-line-height-relaxed)] text-[var(--wsj-text-black)] group-hover:underline mb-1 line-clamp-3">
                                    {article.title}
                                  </h4>
                                </Link>
                                <div className="text-[var(--wsj-font-size-xs)] text-[var(--wsj-text-medium-gray)] font-sans">
                                  By <Link href={`/editor/${article.editor.slug}`} className="hover:underline">{article.editor.name}</Link>
                                </div>
                              </div>
                            </div>
                            {idx < popularArticles.length - 1 && (
                              <div className="mt-5 wsj-article-separator" />
                            )}
                          </article>
                        )
                      })}
                    </div>
                  </div>
                )}

                {/* Side Banner - Vertical */}
                <div className="pt-6 border-t border-[var(--wsj-border-light)]">
                  <AdBannerFetcher type="homepage-side" />
                </div>
              </div>
            </div>

            {/* Exclusive Stories Section (2 columns in middle) */}
            {exclusiveArticles.length > 0 && (
              <div className="mb-12 py-8 border-t border-[var(--wsj-border-light)]">
                <h2 className="font-serif font-bold text-[var(--wsj-font-size-3xl)] mb-6 text-[var(--wsj-text-black)]">Exclusive Stories</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {exclusiveArticles.map((article, index) => {
                    const articleUrl = getArticleUrl(article)
                    const articleImageUrl = article.featuredImageMediaId
                      ? `${baseUrl}/api/media/${article.featuredImageMediaId}`
                      : article.featuredImage || null
                    return (
                      <article key={article.id} className="group">
                        <Link href={articleUrl} className="block">
                          {articleImageUrl && (
                            <div className="relative w-full aspect-[16/10] overflow-hidden mb-3">
                              <Image
                                src={articleImageUrl}
                                alt={article.featuredImageAltText || article.title}
                                fill
                                loading="lazy"
                                className="object-cover"
                                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                              />
                            </div>
                          )}
                          <h3 className="font-serif font-bold text-[var(--wsj-font-size-base)] leading-[var(--wsj-line-height-relaxed)] text-[var(--wsj-text-black)] group-hover:underline mb-2">
                            {article.title}
                          </h3>
                          {article.excerpt && (
                            <p className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-dark-gray)] line-clamp-2 font-serif mb-2">
                              {article.excerpt}
                            </p>
                          )}
                          <div className="text-[var(--wsj-font-size-xs)] text-[var(--wsj-text-medium-gray)] font-sans">
                            {article.category.name}
                          </div>
                        </Link>
                      </article>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Categories Section */}
            {categories.length > 0 && (
              <div className="mb-12 py-8 border-t border-[var(--wsj-border-light)]">
                <div className="space-y-10">
                  {categories.map((category) => {
                    const categoryArticles = displayLatestArticles
                      .filter(a => a.category?.id === category.id)
                      .slice(0, 6)

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
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                          {categoryArticles.map((article, idx) => {
                            const articleUrl = getArticleUrl(article)
                            const showImage = idx === 0 // Only first article has image
                            const articleImageUrl = showImage && article.featuredImageMediaId
                              ? `${baseUrl}/api/media/${article.featuredImageMediaId}`
                              : showImage && article.featuredImage || null

                            return (
                              <article key={article.id} className="group">
                                <Link href={articleUrl} className="block">
                                  {showImage && articleImageUrl && (
                                    <div className="relative w-full aspect-[16/10] overflow-hidden mb-3">
                                      <Image
                                        src={articleImageUrl}
                                        alt={article.title}
                                        fill
                                        loading="lazy"
                                        className="object-cover"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                                      />
                                    </div>
                                  )}
                                  <h4 className="font-serif font-bold text-[var(--wsj-font-size-base)] leading-[var(--wsj-line-height-relaxed)] text-[var(--wsj-text-black)] group-hover:underline mb-2">
                                    {article.title}
                                  </h4>
                                  {showImage && article.excerpt && (
                                    <p className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-dark-gray)] line-clamp-2 font-serif mb-2">
                                      {article.excerpt}
                                    </p>
                                  )}
                                  <div className="text-[var(--wsj-font-size-xs)] text-[var(--wsj-text-medium-gray)] font-sans">
                                    {article.readTime} min read
                                  </div>
                                </Link>
                              </article>
                            )
                          })}
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

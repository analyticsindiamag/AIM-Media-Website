import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { format } from 'date-fns'
import { MessageCircle, Clock } from 'lucide-react'
import { getArticleUrl } from '@/lib/article-url'
import { AdBannerFetcher } from '@/components/ad-banner-fetcher'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static params for all categories
export async function generateStaticParams() {
  try {
    const categories = await prisma.category.findMany({
      select: { slug: true },
    })

    return categories.map((category) => ({
      slug: category.slug,
    }))
  } catch (error) {
    // During build, database might not be available
    // Return empty array to allow build to continue
    console.warn('Failed to generate static params for category/[slug]:', error)
    return []
  }
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const category = await prisma.category.findUnique({
    where: { slug },
  })

  if (!category) {
    return {
      title: 'Category Not Found',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return {
    title: category.name,
    description: category.description || `Latest ${category.name} articles and news`,
    alternates: {
      canonical: `/category/${slug}`,
    },
    openGraph: {
      type: 'website',
      url: `${baseUrl}/category/${slug}`,
      title: category.name,
      description: category.description || `Latest ${category.name} articles and news`,
    },
    twitter: {
      card: 'summary',
      title: category.name,
      description: category.description || `Latest ${category.name} articles and news`,
    },
  }
}

// Revalidate every 60 seconds (set to 0 for development to disable caching)
export const revalidate = 0

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  
  const [category, articles, popularArticles] = await Promise.all([
    prisma.category.findUnique({
      where: { slug },
    }),
    prisma.article.findMany({
      where: {
        published: true,
        category: {
          slug,
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      include: {
        category: true,
        editor: true,
        featuredImageMedia: {
          select: { id: true },
        },
      },
    }),
    // Most popular articles in this category
    prisma.article.findMany({
      where: {
        published: true,
        category: {
          slug,
        },
      },
      orderBy: { views: 'desc' },
      take: 5,
      include: {
        category: true,
        editor: true,
        featuredImageMedia: {
          select: { id: true },
        },
      },
    }),
  ])

  if (!category) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // CollectionPage Schema for Category
  const collectionPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: category.name,
    description: category.description || `Latest ${category.name} articles and news`,
    url: `${baseUrl}/category/${category.slug}`,
    mainEntity: {
      '@type': 'ItemList',
      numberOfItems: articles.length,
      itemListElement: articles.map((article, index) => {
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
            },
          },
        }
      }),
    },
  }

  // Split articles: first one as hero, rest in groups of 3
  const [heroArticle, ...restArticles] = articles
  // Group remaining articles into rows of 3
  const articleRows: (typeof articles)[] = []
  for (let i = 0; i < restArticles.length; i += 3) {
    articleRows.push(restArticles.slice(i, i + 3))
  }

  return (
    <>
      {/* CollectionPage Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageSchema),
        }}
      />
      <div className="bg-white min-h-screen">
        {/* Advertisement Banner after navbar */}
        <div className="border-b border-[var(--wsj-border-light)]">
          <AdBannerFetcher type="article-top" />
        </div>

        <div className="py-6 md:py-8">
          <div className="max-w-[1400px] mx-auto px-6 md:px-8 lg:px-12">
            {/* Big Heading */}
            <h1 className="font-serif font-bold text-[48px] md:text-[56px] leading-[1.1] text-[var(--wsj-text-black)] mb-8">
              {category.name}
            </h1>

            {articles.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-[var(--wsj-text-medium-gray)] text-lg font-sans">
                  No articles found in this category yet.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-[70%_30%] gap-6 lg:gap-8">
                {/* First Column - 70% - Articles */}
                <div className="space-y-8">
                  {/* First Story - Big Image with Text on Side */}
                  {heroArticle && (() => {
                    const heroUrl = getArticleUrl(heroArticle)
                    const heroImageUrl = heroArticle.featuredImageMediaId
                      ? `${baseUrl}/api/media/${heroArticle.featuredImageMediaId}`
                      : heroArticle.featuredImage || null
                    return (
                      <article className="group w-full">
                        <div className="flex flex-col md:flex-row gap-6">
                          {/* Big Image */}
                          {heroImageUrl && (
                            <Link href={heroUrl} className="block relative w-full md:w-[45%] h-[300px] md:h-[350px] flex-shrink-0 overflow-hidden">
                              <Image
                                src={heroImageUrl}
                                alt={heroArticle.featuredImageAltText || heroArticle.title}
                                fill
                                priority
                                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                sizes="(max-width: 768px) 100vw, 45vw"
                              />
                            </Link>
                          )}
                          
                          {/* Text Content */}
                          <div className="flex-1 flex flex-col justify-center">
                            {/* Category */}
                            <div className="mb-2">
                              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[var(--wsj-blue-primary)]">
                                {heroArticle.category.name}
                              </span>
                            </div>
                            
                            {/* Title */}
                            <Link href={heroUrl}>
                              <h2 className="font-serif font-bold text-[28px] md:text-[32px] leading-[1.2] text-[var(--wsj-text-black)] group-hover:underline mb-3">
                                {heroArticle.title}
                              </h2>
                            </Link>
                            
                            {/* Excerpt */}
                            {heroArticle.excerpt && (
                              <p className="text-[16px] text-[var(--wsj-text-dark-gray)] mb-4 font-sans leading-[1.5] line-clamp-3">
                                {heroArticle.excerpt}
                              </p>
                            )}
                            
                            {/* Author and Date */}
                            <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--wsj-text-medium-gray)] font-sans">
                              <span className="text-[var(--wsj-blue-primary)]">
                                By <Link href={`/editor/${heroArticle.editor.slug}`} className="hover:underline">
                                  {heroArticle.editor.name}
                                </Link>
                              </span>
                              {heroArticle.publishedAt && (
                                <>
                                  <span>•</span>
                                  <span>{format(heroArticle.publishedAt, 'MMM d, yyyy')}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })()}

                  {/* Articles in Rows of 3 */}
                  {articleRows.map((rowArticles, rowIndex) => (
                    <div key={rowIndex} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {rowArticles.map((article) => {
                        const articleUrl = getArticleUrl(article)
                        const articleImageUrl = article.featuredImageMediaId
                          ? `${baseUrl}/api/media/${article.featuredImageMediaId}`
                          : article.featuredImage || null
                        return (
                          <article key={article.id} className="group">
                            {/* Article Image */}
                            {articleImageUrl && (
                              <Link href={articleUrl} className="block relative w-full h-[180px] mb-3 overflow-hidden">
                                <Image
                                  src={articleImageUrl}
                                  alt={article.featuredImageAltText || article.title}
                                  fill
                                  className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                  sizes="(max-width: 768px) 100vw, 33vw"
                                />
                              </Link>
                            )}
                            
                            {/* Category */}
                            <div className="mb-2">
                              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[var(--wsj-text-medium-gray)]">
                                {article.category.name}
                              </span>
                            </div>
                            
                            {/* Title */}
                            <Link href={articleUrl}>
                              <h3 className="font-serif font-bold text-[18px] leading-[1.25] text-[var(--wsj-text-black)] group-hover:underline mb-2">
                                {article.title}
                              </h3>
                            </Link>
                            
                            {/* Author and Date */}
                            <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--wsj-text-medium-gray)] font-sans">
                              <span className="text-[var(--wsj-blue-primary)]">
                                By <Link href={`/editor/${article.editor.slug}`} className="hover:underline">
                                  {article.editor.name}
                                </Link>
                              </span>
                              {article.publishedAt && (
                                <>
                                  <span>•</span>
                                  <span>{format(article.publishedAt, 'MMM d')}</span>
                                </>
                              )}
                            </div>
                          </article>
                        )
                      })}
                    </div>
                  ))}
                </div>

                {/* Second Column - 30% - Most Popular */}
                <aside className="lg:pl-6 lg:border-l border-[var(--wsj-border-light)]">
                  <h2 className="font-serif font-bold text-[24px] text-[var(--wsj-text-black)] mb-6">
                    Most Popular
                  </h2>
                  <div className="space-y-6">
                    {popularArticles.map((article, index) => {
                      const articleUrl = getArticleUrl(article)
                      const articleImageUrl = article.featuredImageMediaId
                        ? `${baseUrl}/api/media/${article.featuredImageMediaId}`
                        : article.featuredImage || null
                      return (
                        <article key={article.id} className="group">
                          <div className="flex gap-3">
                            {/* Content */}
                            <div className="flex-1">
                              {/* Article Image */}
                              {articleImageUrl && (
                                <Link href={articleUrl} className="block relative w-full h-[120px] mb-2 overflow-hidden">
                                  <Image
                                    src={articleImageUrl}
                                    alt={article.featuredImageAltText || article.title}
                                    fill
                                    className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                    sizes="(max-width: 768px) 100vw, 30vw"
                                  />
                                </Link>
                              )}
                              
                              {/* Title */}
                              <Link href={articleUrl}>
                                <h3 className="font-serif font-bold text-[16px] leading-[1.3] text-[var(--wsj-text-black)] group-hover:underline mb-1">
                                  {article.title}
                                </h3>
                              </Link>
                              
                              {/* Date */}
                              {article.publishedAt && (
                                <div className="text-[12px] text-[var(--wsj-text-medium-gray)] font-sans">
                                  {format(article.publishedAt, 'MMM d, yyyy')}
                                </div>
                              )}
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </aside>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

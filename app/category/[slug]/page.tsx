import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { format } from 'date-fns'
import { MessageCircle, Clock } from 'lucide-react'
import { getArticleUrl } from '@/lib/article-url'

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

// Revalidate every 60 seconds
export const revalidate = 60

export default async function CategoryPage({ params }: PageProps) {
  const { slug } = await params
  
  const [category, articles] = await Promise.all([
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

  // Split articles: first one as hero, next 3 in top grid, rest below
  const [heroArticle, ...restArticles] = articles
  const gridArticles = restArticles.slice(0, 3)
  const additionalArticles = restArticles.slice(3)

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
        <div className="wsj-container py-8 md:py-12">
          {/* Category Header - WSJ Style */}
          <div className="mb-8 pb-6 border-b border-[var(--wsj-border-light)]">
            <h1 className="font-serif font-bold text-[42px] leading-[var(--wsj-line-height-tight)] text-[var(--wsj-text-black)]">
              {category.name}
            </h1>
          </div>

          {articles.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-[var(--wsj-text-medium-gray)] text-lg font-sans">
                No articles found in this category yet.
              </p>
            </div>
          ) : (
            <>
              {/* Hero Featured Article */}
              {heroArticle && (
                <article className="group mb-12 pb-12 border-b border-[var(--wsj-border-light)]">
                  <div className="flex flex-col md:flex-row gap-6 md:gap-8">
                    {/* Hero Image - Left Side */}
                    {(() => {
                      const heroUrl = getArticleUrl(heroArticle)
                      const heroImageUrl = heroArticle.featuredImageMediaId
                        ? `${baseUrl}/api/media/${heroArticle.featuredImageMediaId}`
                        : heroArticle.featuredImage || null
                      return (
                        <>
                          {heroImageUrl && (
                            <Link href={heroUrl} className="block relative w-full md:w-[55%] h-[300px] md:h-[400px] flex-shrink-0 overflow-hidden">
                              <Image
                                src={heroImageUrl}
                                alt={heroArticle.featuredImageAltText || heroArticle.title}
                                fill
                                priority
                                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                sizes="(max-width: 768px) 100vw, 55vw"
                              />
                            </Link>
                          )}
                          
                          {/* Hero Content - Right Side */}
                          <div className="flex-1 flex flex-col justify-center">
                            {/* Badge if featured */}
                            {heroArticle.featured && (
                              <div className="inline-block mb-3">
                                <span className="text-[11px] font-sans font-bold uppercase tracking-wider px-2 py-1 border border-[var(--wsj-text-black)] text-[var(--wsj-text-black)]">
                                  Featured
                                </span>
                              </div>
                            )}
                            
                            {/* Title */}
                            <Link href={heroUrl}>
                              <h2 className="font-serif font-bold text-[32px] md:text-[40px] leading-[var(--wsj-line-height-tight)] text-[var(--wsj-text-black)] group-hover:underline mb-4">
                                {heroArticle.title}
                              </h2>
                            </Link>
                            
                            {/* Excerpt */}
                            {heroArticle.excerpt && (
                              <p className="text-[17px] text-[var(--wsj-text-dark-gray)] mb-4 font-serif leading-[var(--wsj-line-height-loose)]">
                                {heroArticle.excerpt}
                              </p>
                            )}
                            
                            {/* Author and Metadata */}
                            <div className="flex flex-wrap items-center gap-2 text-[13px] text-[var(--wsj-text-medium-gray)] font-sans">
                              <span className="text-[var(--wsj-blue-primary)]">
                                By <Link href={`/editor/${heroArticle.editor.slug}`} className="hover:underline">
                                  {heroArticle.editor.name}
                                </Link>
                              </span>
                              {heroArticle.publishedAt && (
                                <>
                                  <span>•</span>
                                  <span>{format(heroArticle.publishedAt, 'MMMM d, yyyy')}</span>
                                </>
                              )}
                              {heroArticle.readTime && (
                                <>
                                  <span>•</span>
                                  <div className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    <span>{heroArticle.readTime} min read</span>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </article>
              )}

              {/* Grid of 3 Articles */}
              {gridArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 pb-12 border-b border-[var(--wsj-border-light)]">
                  {gridArticles.map((article) => {
                    const articleUrl = getArticleUrl(article)
                    const articleImageUrl = article.featuredImageMediaId
                      ? `${baseUrl}/api/media/${article.featuredImageMediaId}`
                      : article.featuredImage || null
                    return (
                      <article key={article.id} className="group">
                        {/* Article Image */}
                        {articleImageUrl && (
                          <Link href={articleUrl} className="block relative w-full h-[200px] mb-4 overflow-hidden">
                            <Image
                              src={articleImageUrl}
                              alt={article.featuredImageAltText || article.title}
                              fill
                              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                              sizes="(max-width: 768px) 100vw, 33vw"
                            />
                          </Link>
                        )}
                        
                        {/* Category Tag */}
                        <div className="mb-2">
                          <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[var(--wsj-text-medium-gray)]">
                            {article.category.name}
                          </span>
                        </div>
                        
                        {/* Title */}
                        <Link href={articleUrl}>
                          <h3 className="font-serif font-bold text-[20px] leading-[var(--wsj-line-height-normal)] text-[var(--wsj-text-black)] group-hover:underline mb-3">
                            {article.title}
                          </h3>
                        </Link>
                        
                        {/* Excerpt */}
                        {article.excerpt && (
                          <p className="text-[15px] text-[var(--wsj-text-dark-gray)] mb-3 font-serif leading-[var(--wsj-line-height-loose)] line-clamp-3">
                            {article.excerpt}
                          </p>
                        )}
                        
                        {/* Author and Metadata */}
                        <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--wsj-text-medium-gray)] font-sans">
                          <span className="text-[var(--wsj-blue-primary)]">
                            By <Link href={`/editor/${article.editor.slug}`} className="hover:underline">
                              {article.editor.name}
                            </Link>
                          </span>
                          {article.publishedAt && (
                            <>
                              <span>•</span>
                              <span>{format(article.publishedAt, 'h:mm a')}</span>
                            </>
                          )}
                          {article.readTime && (
                            <>
                              <span>•</span>
                              <span>{article.readTime} min read</span>
                            </>
                          )}
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}

              {/* Additional Articles - 2 Column Grid */}
              {additionalArticles.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {additionalArticles.map((article) => {
                    const articleUrl = getArticleUrl(article)
                    const articleImageUrl = article.featuredImageMediaId
                      ? `${baseUrl}/api/media/${article.featuredImageMediaId}`
                      : article.featuredImage || null
                    return (
                      <article key={article.id} className="group pb-8 border-b border-[var(--wsj-border-light)]">
                        <div className="flex gap-4">
                          {/* Article Image */}
                          {articleImageUrl && (
                            <Link href={articleUrl} className="block relative w-[140px] h-[100px] flex-shrink-0 overflow-hidden">
                              <Image
                                src={articleImageUrl}
                                alt={article.featuredImageAltText || article.title}
                                fill
                                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                sizes="140px"
                              />
                            </Link>
                          )}
                          
                          {/* Article Content */}
                          <div className="flex-1">
                            {/* Category Tag */}
                            <div className="mb-2">
                              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-[var(--wsj-text-medium-gray)]">
                                {article.category.name}
                              </span>
                            </div>
                            
                            {/* Title */}
                            <Link href={articleUrl}>
                              <h3 className="font-serif font-bold text-[18px] leading-[var(--wsj-line-height-normal)] text-[var(--wsj-text-black)] group-hover:underline mb-2">
                                {article.title}
                              </h3>
                            </Link>
                            
                            {/* Author and Metadata */}
                            <div className="flex flex-wrap items-center gap-2 text-[12px] text-[var(--wsj-text-medium-gray)] font-sans">
                              <span className="text-[var(--wsj-blue-primary)]">
                                By <Link href={`/editor/${article.editor.slug}`} className="hover:underline">
                                  {article.editor.name}
                                </Link>
                              </span>
                              {article.publishedAt && (
                                <>
                                  <span>•</span>
                                  <span>{format(article.publishedAt, 'h:mm a')}</span>
                                </>
                              )}
                              {article.readTime && (
                                <>
                                  <span>•</span>
                                  <span>{article.readTime} min read</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                      </article>
                    )
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  )
}

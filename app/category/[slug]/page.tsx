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
      itemListElement: articles.map((article, index) => ({
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
          },
        },
      })),
    },
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
      <div className="wsj-container py-8 md:py-12">
        {/* Category Banner Image */}
        {category.bannerImage && (
          <div className="relative w-full h-[300px] md:h-[400px] lg:h-[500px] mb-8 rounded-lg overflow-hidden">
            <Image
              src={category.bannerImage}
              alt={`${category.name} banner`}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
          </div>
        )}

        {/* Category Header - WSJ Style */}
        <div className="mb-8 pb-6 border-b border-[var(--wsj-border-light)]">
          {/* Sub-heading */}
          <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] mb-2 font-sans uppercase">
            {category.name.split(' ')[0]}
          </div>
          
          {/* Main Title */}
          <h1 className="font-serif font-bold text-[var(--wsj-font-size-5xl)] md:text-[var(--wsj-font-size-6xl)] leading-[var(--wsj-line-height-tight)] text-[var(--wsj-text-black)]">
            {category.name}
          </h1>
          
          {category.description && (
            <p className="text-[var(--wsj-font-size-md)] text-[var(--wsj-text-medium-gray)] mt-4 font-sans">
              {category.description}
            </p>
          )}
        </div>

        {/* Latest News Section */}
        <div className="mb-8">
          <h2 className="text-[var(--wsj-font-size-base)] font-bold text-[var(--wsj-text-black)] mb-6 font-sans">
            Latest News
          </h2>
          
          {/* Articles List */}
          {articles.length > 0 ? (
            <div className="space-y-8">
              {articles.map((article) => {
                const articleUrl = getArticleUrl(article)
                return (
                <article key={article.id} className="group">
                  <div className="flex flex-col md:flex-row gap-4 md:gap-6">
                    {/* Article Image */}
                    {article.featuredImage && (
                      <Link href={articleUrl} className="block relative w-full md:w-[200px] h-[200px] md:h-[150px] flex-shrink-0 overflow-hidden">
                        <Image
                          src={article.featuredImage}
                          alt={article.featuredImageAltText || article.title}
                          fill
                          loading="lazy"
                          className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 768px) 100vw, 200px"
                        />
                      </Link>
                    )}
                    
                    {/* Article Content */}
                    <div className="flex-1">
                      {/* Title */}
                      <Link href={articleUrl}>
                        <h3 className="font-serif font-bold text-[var(--wsj-font-size-2xl)] md:text-[var(--wsj-font-size-3xl)] leading-[var(--wsj-line-height-normal)] text-[var(--wsj-text-black)] group-hover:underline mb-2">
                          {article.title}
                        </h3>
                      </Link>
                      
                      {/* Excerpt */}
                      {article.excerpt && (
                        <Link href={articleUrl} className="block">
                          <p className="text-[var(--wsj-font-size-md)] text-[var(--wsj-text-dark-gray)] mb-3 font-serif leading-[var(--wsj-line-height-loose)] line-clamp-2">
                            {article.excerpt}
                          </p>
                        </Link>
                      )}
                      
                      {/* Author and Metadata */}
                      <div className="flex items-center gap-4 text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
                        <Link href={`/editor/${article.editor.slug}`} className="text-[var(--wsj-blue-primary)] hover:underline">
                          By {article.editor.name}
                        </Link>
                        {article.publishedAt && (
                          <>
                            <span className="text-[var(--wsj-border-light)]">·</span>
                            <span>{format(article.publishedAt, 'MMMM d, yyyy')}</span>
                          </>
                        )}
                        {article.readTime && (
                          <>
                            <span className="text-[var(--wsj-border-light)]">·</span>
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{article.readTime} min read</span>
                            </div>
                          </>
                        )}
                        <span className="text-[var(--wsj-border-light)]">·</span>
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>0</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {article.id !== articles[articles.length - 1]?.id && (
                    <div className="mt-8 pt-8 border-t border-[var(--wsj-border-light)]" />
                  )}
                </article>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-20">
              <p className="text-[var(--wsj-text-medium-gray)] text-lg font-sans">
                No articles found in this category yet.
              </p>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  )
}

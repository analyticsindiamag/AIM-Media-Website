import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import { AdBannerFetcher } from '@/components/ad-banner-fetcher'
import { ArticleInteractiveBar } from '@/components/article-interactive-bar'
import { getArticleUrl } from '@/lib/article-url'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static params for all published articles
export async function generateStaticParams() {
  const articles = await prisma.article.findMany({
    where: { published: true },
    select: { slug: true },
  })

  return articles.map((article) => ({
    slug: article.slug,
  }))
}

// Generate metadata for SEO
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      editor: true,
    },
  })

  if (!article) {
    return { title: 'Article Not Found' }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  const absoluteImage = article.featuredImage && !article.featuredImage.startsWith('http')
    ? `${baseUrl}${article.featuredImage.startsWith('/') ? '' : '/'}${article.featuredImage}`
    : article.featuredImage || undefined

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || '',
    keywords: [article.category.name, 'AI', 'Technology', 'News'],
    authors: [{ name: article.editor.name }],
    alternates: { canonical: `/article/${slug}` },
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || '',
      type: 'article',
      url: `${baseUrl}/article/${slug}`,
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.editor.name],
      images: absoluteImage ? [{ url: absoluteImage, width: 1200, height: 630, alt: article.featuredImageAltText || article.title }] : [],
      section: article.category.name,
      tags: [article.category.name, 'AI', 'Technology', 'News'],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || '',
      images: absoluteImage ? [absoluteImage] : [],
    },
    other: {
      'article:section': article.category.name,
      'article:tag': article.category.name,
    },
  }
}

// Revalidate every 60 seconds
export const revalidate = 60

export default async function ArticlePage({ params }: PageProps) {
  const { slug } = await params
  
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      editor: true,
    },
  })

  if (!article || !article.published) {
    notFound()
  }

  // Increment views (non-blocking)
  prisma.article
    .update({ where: { id: article.id }, data: { views: { increment: 1 } } })
    .catch(console.error)

  // Fetch related articles from same category
  const relatedArticles = await prisma.article.findMany({
    where: { published: true, categoryId: article.categoryId, NOT: { id: article.id } },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    include: { category: true, editor: true },
  })

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  return (
    <>
      {/* Schema.org JSON-LD for NewsArticle */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            image: article.featuredImage || '',
            datePublished: article.publishedAt?.toISOString(),
            dateModified: article.updatedAt.toISOString(),
            author: { 
              '@type': 'Person', 
              name: article.editor.name,
              url: `${baseUrl}/editor/${article.editor.slug}`,
            },
            publisher: {
              '@type': 'Organization',
              name: 'AI Tech News',
              logo: { '@type': 'ImageObject', url: `${baseUrl}/logo.png` },
            },
            description: article.excerpt || '',
            articleBody: article.content,
            articleSection: article.category.name,
            keywords: [article.category.name, 'AI', 'Technology', 'News'].join(', '),
            mainEntityOfPage: {
              '@type': 'WebPage',
              '@id': `${baseUrl}/article/${article.slug}`,
            },
          }),
        }}
      />

      {/* Breadcrumbs JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BreadcrumbList',
            itemListElement: [
              {
                '@type': 'ListItem',
                position: 1,
                name: 'Home',
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}`,
              },
              {
                '@type': 'ListItem',
                position: 2,
                name: article.category.name,
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/category/${article.category.slug}`,
              },
              {
                '@type': 'ListItem',
                position: 3,
                name: article.title,
                item: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/article/${article.slug}`,
              },
            ],
          }),
        }}
      />

      <article className="bg-white">
        {/* Hero Section with Image Overlay - WSJ Style */}
        {article.featuredImage && (
          <div className="wsj-hero">
            <Image
              src={article.featuredImage}
              alt={article.featuredImageAltText || article.title}
              fill
              priority
              className="object-cover"
              sizes="100vw"
            />
            <div className="wsj-hero-overlay"></div>
            <div className="wsj-hero-content">
              <h1 className="wsj-hero-title">
                {article.title}
              </h1>
              {article.excerpt && (
                <p className="wsj-hero-subtitle">
                  {article.excerpt}
                </p>
              )}
              {/* Interactive Bar */}
              <div className="wsj-interactive-bar">
                <ArticleInteractiveBar
                  url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/article/${article.slug}`}
                  title={article.title}
                  variant="light"
                  readTime={article.readTime}
                />
              </div>
            </div>
          </div>
        )}

        {/* Article Content */}
        <div className="article-container py-6 md:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Main Article Content */}
            <div className="lg:col-span-9 xl:col-span-10">
              {/* Article Header Bar - WSJ Style (only if no hero image) */}
              {!article.featuredImage && (
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-[var(--wsj-border-light)]">
                  <ArticleInteractiveBar
                      url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/article/${article.slug}`}
                      title={article.title}
                    variant="default"
                    readTime={article.readTime}
                  />
                </div>
              )}

              {/* Title - WSJ Style Large Serif (only if no hero image) */}
              {!article.featuredImage && (
                <>
                  <h1 className="font-serif font-bold text-[var(--wsj-font-size-6xl)] md:text-[var(--wsj-font-size-7xl)] leading-[var(--wsj-line-height-tight)] mb-4 text-[var(--wsj-text-black)] max-w-[900px]">
                    {article.title}
                  </h1>

                  {/* Subtitle/Lead Paragraph - WSJ Style */}
                  {article.excerpt && (
                    <p className="text-[var(--wsj-font-size-lg)] md:text-[var(--wsj-font-size-xl)] text-[var(--wsj-text-black)] leading-[var(--wsj-line-height-loose)] mb-6 font-serif max-w-[900px]">
                      {article.excerpt}
                    </p>
                  )}
                </>
              )}

              {/* Caption for hero image */}
              {article.featuredImage && (
                <p className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] italic font-serif mb-2 mt-4">
                  {article.featuredImageCaption || article.category.name}
                </p>
              )}

              {/* Author and Date - WSJ Style */}
              <div className="mb-6 pb-4 border-b border-[var(--wsj-border-light)]">
                <div className="mb-2">
                  <p className="text-[var(--wsj-font-size-base)] text-[var(--wsj-text-black)] font-sans leading-[var(--wsj-line-height-loose)]">
                    By <Link href={`/editor/${article.editor.slug}`} className="font-medium hover:underline">{article.editor.name}</Link>
                    {article.editor.bio && ` | ${article.editor.bio.split('.')[0]}`}
                  </p>
                </div>
                <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
                  {article.publishedAt && format(article.publishedAt, 'MMM. d, yyyy')} {article.publishedAt && format(article.publishedAt, 'h:mm a')} ET
                </div>
              </div>

              {/* Article Content - WSJ Style Body */}
              <div 
                className="article-content max-w-[900px]"
                dangerouslySetInnerHTML={{ __html: article.content }}
              />

              {/* Author Bio Section */}
              <div className="mt-12 pt-8 border-t border-[var(--wsj-border-light)] max-w-[900px]">
                <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] mb-2 font-sans">Written by</div>
                <Link 
                  href={`/editor/${article.editor.slug}`}
                  className="text-[var(--wsj-font-size-base)] font-serif font-bold text-[var(--wsj-text-black)] hover:underline"
                >
                  {article.editor.name}
                </Link>
                {article.editor.bio && (
                  <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] mt-2 font-sans leading-[var(--wsj-line-height-loose)]">
                    {article.editor.bio}
                  </div>
                )}
              </div>
            </div>

            {/* Sidebar with Ad Banner */}
            <div className="lg:col-span-3 xl:col-span-2 lg:pl-8 xl:pl-12 lg:border-l border-[var(--wsj-border-light)]">
              <div className="sticky top-24">
                <AdBannerFetcher type="article-side" />
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="border-t border-[var(--wsj-border-light)] bg-white py-10 md:py-12">
            <div className="wsj-container">
              <h2 className="text-[var(--wsj-font-size-sm)] tracking-wide uppercase text-[var(--wsj-text-medium-gray)] mb-8 font-sans font-bold">
                More From {article.category.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedArticles.map((relatedArticle) => {
                  const relatedUrl = getArticleUrl(relatedArticle)
                  return (
                  <article key={relatedArticle.id} className="group">
                    <Link href={relatedUrl}>
                      {relatedArticle.featuredImage && (
                        <div className="relative w-full h-[200px] md:h-[240px] overflow-hidden mb-4">
                          <Image
                            src={relatedArticle.featuredImage}
                            alt={relatedArticle.title}
                            fill
                            loading="lazy"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      )}
                      <h3 className="font-serif font-bold text-xl md:text-2xl leading-tight text-[var(--wsj-text-black)] group-hover:underline mb-2">
                        {relatedArticle.title}
                      </h3>
                    </Link>
                    <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
                      {relatedArticle.publishedAt && format(relatedArticle.publishedAt, 'MMM d, yyyy')}
                      {relatedArticle.publishedAt && ' · '}
                      <Link href={`/editor/${relatedArticle.editor.slug}`} className="hover:underline">
                        {relatedArticle.editor.name}
                      </Link>
                    </div>
                  </article>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </article>
    </>
  )
}

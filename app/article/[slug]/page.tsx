import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import { AdBannerFetcher } from '@/components/ad-banner-fetcher'
import { ArticleInteractiveBar } from '@/components/article-interactive-bar'
import { CommentsSection } from '@/components/comments-section'
import { ArticleViewTracker } from '@/components/article-view-tracker'
import { getArticleUrl } from '@/lib/article-url'
import { getCurrentUser } from '@/lib/session'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static params for all published articles
export async function generateStaticParams() {
  try {
    const articles = await prisma.article.findMany({
      where: { published: true },
      select: { slug: true },
    })

    return articles.map((article) => ({
      slug: article.slug,
    }))
  } catch (error) {
    // During build, database might not be available
    // Return empty array to allow build to continue
    console.warn('Failed to generate static params for article/[slug]:', error)
    return []
  }
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
  
  // Get featured image URL - prefer media gallery, fallback to URL
  const featuredImageUrl = article.featuredImageMediaId
    ? `${baseUrl}/api/media/${article.featuredImageMediaId}`
    : article.featuredImage || null
  
  const absoluteImage = featuredImageUrl && !featuredImageUrl.startsWith('http')
    ? `${baseUrl}${featuredImageUrl.startsWith('/') ? '' : '/'}${featuredImageUrl}`
    : featuredImageUrl || undefined

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
  const user = await getCurrentUser()
  
  const article = await prisma.article.findUnique({
    where: { slug },
    include: {
      category: true,
      editor: true,
      featuredImageMedia: {
        select: {
          id: true,
          altText: true,
        },
      },
    },
  })

  if (!article || !article.published) {
    notFound()
  }

  // Check if user liked this article
  let isLiked = false
  if (user) {
    const like = await prisma.like.findUnique({
      where: {
        userId_articleId: {
          userId: user.id,
          articleId: article.id,
        },
      },
    })
    isLiked = !!like
  }

  // Track view (non-blocking) - will be called from client component

  // Fetch related articles from same category
  const relatedArticles = await prisma.article.findMany({
    where: { published: true, categoryId: article.categoryId, NOT: { id: article.id } },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    include: { 
      category: true, 
      editor: true,
      featuredImageMedia: {
        select: { id: true },
      },
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  
  // Get featured image URL - prefer media gallery, fallback to URL
  const featuredImageUrl = article.featuredImageMediaId
    ? `${baseUrl}/api/media/${article.featuredImageMediaId}`
    : article.featuredImage || null

  return (
    <>
      <ArticleViewTracker articleSlug={article.slug} />
      {/* Schema.org JSON-LD for NewsArticle */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'NewsArticle',
            headline: article.title,
            image: featuredImageUrl || '',
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
        {/* Advertisement Banner after navbar */}
        <div className="border-b border-[var(--wsj-border-light)]">
          <AdBannerFetcher type="article-top" />
        </div>

        {/* Article Container */}
        <div className="article-container py-6 md:py-8">
          <div className="max-w-[760px] mx-auto px-6 md:px-12 lg:px-16">
            {/* Category - Centered, small blue text */}
            <div className="flex justify-center mb-4">
              <Link 
                href={`/category/${article.category.slug}`}
                className="text-[var(--wsj-blue-primary)] font-sans text-[12px] font-medium uppercase tracking-wider hover:underline"
              >
                {article.category.name}
              </Link>
            </div>

            {/* Article Title */}
            <h1 className="font-serif font-bold text-[36px] md:text-[44px] leading-[1.1] mb-4 text-[var(--wsj-text-black)]">
              {article.title}
            </h1>

            {/* Subtitle/Excerpt - Normal text, lighter */}
            {article.excerpt && (
              <p className="text-[16px] text-[#666666] leading-[1.5] mb-6 font-sans">
                {article.excerpt}
              </p>
            )}
 
            {/* By editor, then date */}
                <div className="mb-6 space-y-1">
              <div className="flex items-center gap-1 text-[14px] font-sans">
                <span className="text-[var(--wsj-text-dark-gray)]">By</span>
                <Link 
                  href={`/editor/${article.editor.slug}`}
                  className="text-[var(--wsj-blue-primary)] hover:underline font-medium"
                >
                  {article.editor.name}
                </Link>
              </div>
              <div className="text-[13px] text-[#666666] font-sans">
                {article.publishedAt && format(article.publishedAt, 'MMM. d, yyyy h:mm a')} ET
              </div>
            </div>

            {/* Article tools (share, resize, comment) */}
            <div className="mb-8 flex justify-center">
              <ArticleInteractiveBar
                url={`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/article/${article.slug}`}
                title={article.title}
                articleSlug={article.slug}
                variant="default"
                readTime={article.readTime}
                initialLikesCount={article.likesCount}
                initialIsLiked={isLiked}
              />
            </div>

            {/* Featured Image - Full column width */}
            {featuredImageUrl && (
              <div className="mb-6 w-full">
                <div className="relative w-full aspect-[1.5/1] overflow-hidden">
                  <Image
                    src={featuredImageUrl}
                    alt={article.featuredImageAltText || article.title}
                    fill
                    priority
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 760px"
                  />
                </div>
                {/* Image Caption */}
                {article.featuredImageCaption && (
                  <p className="text-[12px] text-[#666666] font-sans mt-2 italic">
                    {article.featuredImageCaption}
                  </p>
                )}
              </div>
            )}

            {/* Article Content */}
            <div 
              className="article-content mb-8"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />

            {/* Comments Section */}
            <CommentsSection articleSlug={article.slug} />
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="border-t border-[var(--wsj-border-light)] bg-[var(--wsj-bg-light-gray)] py-10 md:py-12">
            <div className="wsj-container">
              <h2 className="text-[13px] tracking-wide uppercase text-[var(--wsj-text-medium-gray)] mb-8 font-sans font-bold">
                More From {article.category.name}
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedArticles.map((relatedArticle) => {
                  const relatedUrl = getArticleUrl(relatedArticle)
                  const relatedImageUrl = relatedArticle.featuredImageMediaId
                    ? `${baseUrl}/api/media/${relatedArticle.featuredImageMediaId}`
                    : relatedArticle.featuredImage || null
                  return (
                  <article key={relatedArticle.id} className="group bg-white">
                    {relatedImageUrl && (
                    <Link href={relatedUrl} className="block relative w-full h-[200px] md:h-[240px] overflow-hidden">
                      <Image
                        src={relatedImageUrl}
                        alt={relatedArticle.title}
                        fill
                        loading="lazy"
                        className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                        sizes="(max-width: 768px) 100vw, 33vw"
                      />
                    </Link>
                    )}
                    <div className="p-4">
                      <Link href={relatedUrl}>
                        <h3 className="font-serif font-bold text-xl md:text-2xl leading-tight text-[var(--wsj-text-black)] group-hover:underline mb-2">
                          {relatedArticle.title}
                        </h3>
                      </Link>
                      <div className="text-[13px] text-[var(--wsj-text-medium-gray)] font-sans">
                        {relatedArticle.publishedAt && format(relatedArticle.publishedAt, 'MMM d, yyyy')}
                        {relatedArticle.publishedAt && ' · '}
                        <Link href={`/editor/${relatedArticle.editor.slug}`} className="hover:underline">
                          {relatedArticle.editor.name}
                        </Link>
                      </div>
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

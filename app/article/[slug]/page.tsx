import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Metadata } from 'next'
import ShareButtons from '@/components/share-buttons'

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
      images: absoluteImage ? [{ url: absoluteImage, width: 1200, height: 630, alt: article.title }] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || '',
      images: absoluteImage ? [absoluteImage] : [],
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

  const canonicalUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/article/${article.slug}`

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
            author: { '@type': 'Person', name: article.editor.name },
            publisher: {
              '@type': 'Organization',
              name: 'Port',
              logo: { '@type': 'ImageObject', url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png` },
            },
            description: article.excerpt || '',
            articleBody: article.content,
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

      <article className="bg-white dark:bg-[#0a0a0a]">
        <div className="article-container py-8 md:py-12">
          {/* Hero Image */}
          {article.featuredImage && (
            <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] mb-8 md:mb-12 image-frame">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 900px"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6 text-black dark:text-white">
            {article.title}
          </h1>

          {/* Subheading */}
          {article.excerpt && (
            <p className="text-xl md:text-2xl text-[#666666] dark:text-[#999999] leading-relaxed mb-6 font-normal">
              {article.excerpt}
            </p>
          )}

          {/* Byline / Meta - NYT Style */}
          <div className="text-sm text-[#666666] dark:text-[#999999] mb-8 pb-8 border-b border-border">
            {article.publishedAt && format(article.publishedAt, 'MMMM d, yyyy')}
            {' · '}
            By <span className="italic">{article.editor.name}</span>
            {' · '}
            In{' '}
            <Link 
              href={`/category/${article.category.slug}`} 
              className="hover:underline text-black dark:text-white"
            >
              {article.category.name}
            </Link>
          </div>

          {/* Share Buttons */}
          <div className="mb-8">
            <ShareButtons url={canonicalUrl} title={article.title} />
          </div>

          {/* Article Content - NYT Style Body */}
          <div 
            className="prose prose-lg max-w-none article-content"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Author Bio */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="text-sm text-[#666666] dark:text-[#999999] mb-2">Written by</div>
            <div className="text-lg font-serif font-bold text-black dark:text-white">{article.editor.name}</div>
            {article.editor.bio && (
              <div className="text-base text-[#666666] dark:text-[#999999] mt-2">{article.editor.bio}</div>
            )}
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="border-t border-border bg-white dark:bg-[#0a0a0a] py-10 md:py-12">
            <div className="content-container">
              <h2 className="text-[13px] tracking-wide uppercase text-[#666666] dark:text-[#999999] mb-8 font-bold">
                Related Articles
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedArticles.map((relatedArticle) => (
                  <article key={relatedArticle.id} className="group">
                    <Link href={`/article/${relatedArticle.slug}`}>
                      {relatedArticle.featuredImage && (
                        <div className="relative w-full h-[200px] md:h-[240px] overflow-hidden image-frame mb-4">
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
                      <h3 className="font-serif font-bold text-xl md:text-2xl leading-tight text-black dark:text-white group-hover:underline mb-2">
                        {relatedArticle.title}
                      </h3>
                      <div className="text-[13px] text-[#666666] dark:text-[#999999]">
                        {relatedArticle.publishedAt && format(relatedArticle.publishedAt, 'MMM d, yyyy')}
                        {relatedArticle.publishedAt && ' · '}
                        {relatedArticle.editor.name}
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            </div>
          </div>
        )}
      </article>
    </>
  )
}


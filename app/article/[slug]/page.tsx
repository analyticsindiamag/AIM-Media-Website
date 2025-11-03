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

      <article className="bg-white">
        <div className="article-container px-4 py-8">
          {/* Featured Image first */}
          {article.featuredImage && (
            <div className="relative w-full h-[400px] md:h-[560px] mb-8 image-frame">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 720px"
              />
            </div>
          )}

          {/* Title */}
          <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-4">
            {article.title}
          </h1>

          {/* Subheading */}
          {article.excerpt && (
            <p className="text-xl text-[var(--muted-foreground)] leading-relaxed mb-4">
              {article.excerpt}
            </p>
          )}

          {/* Byline / Meta */}
          <div className="text-sm text-[var(--muted-foreground)] mb-6">
            {article.publishedAt && format(article.publishedAt, 'MMMM d, yyyy')}
            {' · '}By <span className="italic">{article.editor.name}</span>
            {' · '}In{' '}
            <Link href={`/category/${article.category.slug}`} className="hover:underline">
              {article.category.name}
            </Link>
            {' · '}{article.views} views
          </div>

          {/* Share */}
          <div className="mb-8">
            <ShareButtons url={canonicalUrl} title={article.title} />
          </div>

          {/* Article Content */}
          <div className="prose prose-lg max-w-none" dangerouslySetInnerHTML={{ __html: article.content }} />

          {/* Author */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="text-sm text-[var(--muted-foreground)]">Written by</div>
            <div className="text-lg">{article.editor.name}</div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="border-top border-border bg-white py-10">
            <div className="content-container px-4">
              <h2 className="text-[13px] tracking-wide uppercase text-[var(--muted-foreground)] mb-6">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedArticles.map((relatedArticle) => (
                  <article key={relatedArticle.id} className="group">
                    <Link href={`/article/${relatedArticle.slug}`}>
                      {relatedArticle.featuredImage && (
                        <div className="relative w-full h-[200px] overflow-hidden image-frame mb-3">
                          <Image
                            src={relatedArticle.featuredImage}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      )}
                      <h3 className="font-serif font-bold text-xl leading-tight group-hover:underline">
                        {relatedArticle.title}
                      </h3>
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


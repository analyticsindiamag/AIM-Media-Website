import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { format } from 'date-fns'
import type { Metadata } from 'next'

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
    return {
      title: 'Article Not Found',
    }
  }

  return {
    title: article.metaTitle || article.title,
    description: article.metaDescription || article.excerpt || '',
    keywords: [article.category.name, 'AI', 'Technology', 'News'],
    authors: [{ name: article.editor.name }],
    alternates: {
      canonical: `/article/${slug}`,
    },
    openGraph: {
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || '',
      type: 'article',
      publishedTime: article.publishedAt?.toISOString(),
      modifiedTime: article.updatedAt.toISOString(),
      authors: [article.editor.name],
      images: article.featuredImage
        ? [
            {
              url: article.featuredImage,
              width: 1200,
              height: 630,
              alt: article.title,
            },
          ]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: article.metaTitle || article.title,
      description: article.metaDescription || article.excerpt || '',
      images: article.featuredImage ? [article.featuredImage] : [],
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
    .update({
      where: { id: article.id },
      data: { views: { increment: 1 } },
    })
    .catch(console.error)

  // Fetch related articles from same category
  const relatedArticles = await prisma.article.findMany({
    where: {
      published: true,
      categoryId: article.categoryId,
      NOT: {
        id: article.id,
      },
    },
    take: 3,
    orderBy: { publishedAt: 'desc' },
    include: {
      category: true,
      editor: true,
    },
  })

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
            },
            publisher: {
              '@type': 'Organization',
              name: 'AI Tech News',
              logo: {
                '@type': 'ImageObject',
                url: `${process.env.NEXT_PUBLIC_SITE_URL}/logo.png`,
              },
            },
            description: article.excerpt || '',
            articleBody: article.content,
          }),
        }}
      />

      <article className="bg-white">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Article Meta */}
          <div className="text-center mb-8">
            <div className="text-sm text-muted-foreground mb-4">
              Published on {article.publishedAt && format(article.publishedAt, 'MMMM d, yyyy')}
              {' · '}By{' '}
              <span className="font-medium text-foreground italic">{article.editor.name}</span>
              {' · '}In{' '}
              <Link
                href={`/category/${article.category.slug}`}
                className="font-medium text-primary hover:underline"
              >
                {article.category.name}
              </Link>
            </div>

            {/* Article Title */}
            <h1 className="font-serif font-bold text-4xl md:text-5xl lg:text-6xl leading-tight mb-6">
              {article.title}
            </h1>

            {/* Excerpt */}
            {article.excerpt && (
              <p className="text-xl text-muted-foreground leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Featured Image */}
          {article.featuredImage && (
            <div className="relative w-full h-[400px] md:h-[600px] mb-12 rounded-lg overflow-hidden">
              <Image
                src={article.featuredImage}
                alt={article.title}
                fill
                priority
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 896px"
              />
              <div className="absolute top-4 left-4">
                <div className="bg-black text-white px-2 py-1 text-xs font-black">
                  AI TECH
                </div>
              </div>
            </div>
          )}

          {/* Article Content */}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: article.content }}
          />

          {/* Author Bio */}
          <div className="mt-12 pt-8 border-t border-border">
            <div className="flex items-start gap-4">
              {article.editor.avatar && (
                <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                  <Image
                    src={article.editor.avatar}
                    alt={article.editor.name}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div>
                <h3 className="font-bold text-xl mb-2">{article.editor.name}</h3>
                {article.editor.bio && (
                  <p className="text-muted-foreground">{article.editor.bio}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Related Articles */}
        {relatedArticles.length > 0 && (
          <div className="bg-gray-50 py-12">
            <div className="container mx-auto px-4">
              <h2 className="text-3xl font-bold mb-8">Related Articles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {relatedArticles.map((relatedArticle) => (
                  <article key={relatedArticle.id} className="group">
                    <Link href={`/article/${relatedArticle.slug}`}>
                      {relatedArticle.featuredImage && (
                        <div className="relative w-full h-[200px] overflow-hidden rounded-lg mb-4">
                          <Image
                            src={relatedArticle.featuredImage}
                            alt={relatedArticle.title}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                            sizes="(max-width: 768px) 100vw, 33vw"
                          />
                        </div>
                      )}
                      <h3 className="font-serif font-bold text-xl leading-tight group-hover:text-primary transition-colors">
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


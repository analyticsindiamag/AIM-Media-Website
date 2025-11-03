import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { ArticleCard } from '@/components/article-card'
import Link from 'next/link'
import Image from 'next/image'

// Revalidate every 60 seconds
export const revalidate = 60

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default async function HomePage() {
  // Fetch latest articles
  const [heroArticle, sidebarArticles, enterpriseArticles, startupArticles] = await Promise.all([
    (async () => {
      const featured = await prisma.article.findFirst({
        where: { published: true, featured: true },
        orderBy: { publishedAt: 'desc' },
        include: { category: true, editor: true },
      })
      if (featured) return featured
      return prisma.article.findFirst({
        where: { published: true },
        orderBy: { publishedAt: 'desc' },
        include: { category: true, editor: true },
      })
    })(),
    prisma.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      skip: 1,
      take: 6,
      include: { category: true, editor: true },
    }),
    prisma.article.findMany({
      where: { published: true, category: { slug: 'enterprise-ai' } },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: { category: true, editor: true },
    }),
    prisma.article.findMany({
      where: { published: true, category: { slug: 'ai-startups' } },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: { category: true, editor: true },
    }),
  ])

  return (
    <div className="bg-white min-h-screen">
      <div className="content-container px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main Hero Article */}
          <div className="lg:col-span-2">
            {heroArticle && (
              <article className="group">
                <Link href={`/article/${heroArticle.slug}`}>
                  {heroArticle.featuredImage && (
                    <div className="relative w-full h-[460px] overflow-hidden image-frame mb-6">
                      <Image
                        src={heroArticle.featuredImage}
                        alt={heroArticle.title}
                        fill
                        priority
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 66vw"
                      />
                    </div>
                  )}
                  <h1 className="font-serif font-bold text-4xl md:text-5xl leading-tight group-hover:underline">
                    {heroArticle.title}
                  </h1>
                  {heroArticle.excerpt && (
                    <p className="mt-3 text-xl text-[var(--muted-foreground)] leading-relaxed">
                      {heroArticle.excerpt}
                    </p>
                  )}
                </Link>
              </article>
            )}
          </div>

          {/* Sidebar Articles */}
          <aside className="space-y-6">
            {sidebarArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                size="small"
                showExcerpt={false}
              />
            ))}
          </aside>
        </div>
      </div>

      {enterpriseArticles.length > 0 && (
        <section className="border-t border-border bg-white py-10">
          <div className="content-container px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[13px] tracking-wide uppercase text-[var(--muted-foreground)]">From Enterprise AI</h2>
              <Link href="/category/enterprise-ai" className="text-sm hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {enterpriseArticles.map((article) => (
                <ArticleCard key={article.id} article={article} size="medium" showExcerpt={true} />
              ))}
            </div>
          </div>
        </section>
      )}

      {startupArticles.length > 0 && (
        <section className="border-t border-border bg-white py-10">
          <div className="content-container px-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[13px] tracking-wide uppercase text-[var(--muted-foreground)]">From AI Startups</h2>
              <Link href="/category/ai-startups" className="text-sm hover:underline">View All</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {startupArticles.map((article) => (
                <ArticleCard key={article.id} article={article} size="small" showExcerpt={false} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  )
}

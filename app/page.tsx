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
    // Hero article - prefer featured, fall back to most recent
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
    // Sidebar articles
    prisma.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      skip: 1,
      take: 6,
      include: {
        category: true,
        editor: true,
      },
    }),
    // Enterprise AI section
    prisma.article.findMany({
      where: {
        published: true,
        category: {
          slug: 'enterprise-ai',
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      include: {
        category: true,
        editor: true,
      },
    }),
    // AI Startups section
    prisma.article.findMany({
      where: {
        published: true,
        category: {
          slug: 'ai-startups',
        },
      },
      orderBy: { publishedAt: 'desc' },
      take: 4,
      include: {
        category: true,
        editor: true,
      },
    }),
  ])

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Hero Article */}
          <div className="lg:col-span-2">
            {heroArticle && (
              <article className="group cursor-pointer relative">
                {/* Subtle AI gradient glow */}
                <div className="pointer-events-none absolute -inset-4 -z-10 rounded-2xl bg-[radial-gradient(80%_80%_at_50%_0%,oklch(0.85_0.15_250_/_0.15),transparent_60%)]" />
                <Link href={`/article/${heroArticle.slug}`}>
                  {/* Hero Image */}
                  {heroArticle.featuredImage && (
                    <div className="relative w-full h-[500px] overflow-hidden rounded-lg mb-6">
                      <Image
                        src={heroArticle.featuredImage}
                        alt={heroArticle.title}
                        fill
                        priority
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 1024px) 100vw, 66vw"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
                      <div className="absolute top-4 left-4">
                        <div className="bg-black text-white px-2 py-1 text-xs font-black">
                          AI TECH
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Hero Title */}
                  <h1 className="font-serif font-bold text-4xl md:text-5xl leading-tight group-hover:text-primary transition-colors">
                    {heroArticle.title}
                  </h1>

                  {/* Hero Excerpt */}
                  {heroArticle.excerpt && (
                    <p className="mt-4 text-xl text-muted-foreground leading-relaxed">
                      {heroArticle.excerpt}
                    </p>
                  )}
                </Link>
              </article>
            )}
          </div>

          {/* Sidebar Articles */}
          <div className="space-y-8">
            {sidebarArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                size="small"
                showExcerpt={false}
              />
            ))}
          </div>
        </div>
      </div>

      {/* FROM ENTERPRISE AI Section */}
      {enterpriseArticles.length > 0 && (
        <div className="bg-white py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold uppercase tracking-tight">
                From Enterprise AI
              </h2>
              <Link
                href="/category/enterprise-ai"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {enterpriseArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  size="medium"
                  showExcerpt={true}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* FROM AI STARTUPS Section */}
      {startupArticles.length > 0 && (
        <div className="py-12">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold uppercase tracking-tight">
                From AI Startups
              </h2>
              <Link
                href="/category/ai-startups"
                className="text-sm font-medium hover:text-primary transition-colors"
              >
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {startupArticles.map((article) => (
                <ArticleCard
                  key={article.id}
                  article={article}
                  size="small"
                  showExcerpt={false}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-purple-900 via-purple-700 to-pink-600 py-16 my-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="text-white mb-8 md:mb-0">
              <p className="text-yellow-300 text-sm font-bold mb-2">OUR UPCOMING EVENTS</p>
              <h2 className="text-4xl font-bold mb-2">
                Global leaders, intimate gatherings, bold visions for AI.
              </h2>
              <p className="text-3xl font-serif">Vision World Series</p>
            </div>
            <div className="text-white text-center md:text-right">
              <p className="text-xl font-bold mb-2">Executive-Only Format</p>
              <p className="text-xl font-bold mb-4">Global by Design</p>
              <Link
                href="/conferences"
                className="inline-block bg-white text-black font-bold px-8 py-3 rounded hover:bg-gray-100 transition-colors"
              >
                More Details {'>>'}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

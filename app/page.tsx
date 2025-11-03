import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

// Revalidate every 60 seconds
export const revalidate = 60

export const metadata: Metadata = {
  alternates: {
    canonical: '/',
  },
}

export default async function HomePage() {
  // Fetch articles for NYT-style layout
  const [centerArticle, allArticles] = await Promise.all([
    // Center: Featured large image article
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
    // Get all articles for left and right columns
    prisma.article.findMany({
      where: { published: true },
      orderBy: { publishedAt: 'desc' },
      take: 20,
      include: { category: true, editor: true },
    }),
  ])

  // Filter out center article from other columns
  const articlesWithoutCenter = allArticles.filter(
    (article) => centerArticle && article.id !== centerArticle.id
  )

  const leftColumnArticles = articlesWithoutCenter.slice(0, 8)
  const rightColumnArticles = articlesWithoutCenter.slice(8, 14)

  const today = format(new Date(), 'EEEE, MMMM d, yyyy')

  return (
    <div className="bg-white dark:bg-[#0a0a0a] min-h-screen">
      <div className="content-container py-6 md:py-8">
        {/* Date and Today's Paper */}
        <div className="mb-6 pb-4 border-b border-border">
          <div className="flex items-center gap-4 text-sm text-[#666666] dark:text-[#999999]">
            <span>{today}</span>
            <span>·</span>
            <Link href="/" className="hover:underline text-black dark:text-white">
              Today's Paper
            </Link>
          </div>
        </div>

        {/* Three Column Layout - NYT Style */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
          {/* Left Column - Main Articles */}
          <div className="lg:col-span-5 space-y-6">
            {leftColumnArticles.map((article, index) => (
              <article key={article.id} className="group">
                <Link href={`/article/${article.slug}`} className="block">
                  {/* Lead article gets more space */}
                  {index === 0 ? (
                    <>
                      <h2 className="font-serif font-bold text-2xl md:text-3xl leading-tight mb-2 text-black dark:text-white group-hover:underline">
                        {article.title}
                      </h2>
                      {article.excerpt && (
                        <p className="text-base text-[#666666] dark:text-[#999999] mb-3 line-clamp-3">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-[#666666] dark:text-[#999999]">
                        <span>{article.readTime} MIN READ</span>
                        <span>·</span>
                        <span>{article.editor.name}</span>
                        <span>·</span>
                        <Link href={`/category/${article.category.slug}`} className="hover:underline">
                          {article.category.name}
                        </Link>
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="font-serif font-bold text-lg md:text-xl leading-tight mb-2 text-black dark:text-white group-hover:underline">
                        {article.title}
                      </h3>
                      {article.excerpt && (
                        <p className="text-sm text-[#666666] dark:text-[#999999] mb-2 line-clamp-2">
                          {article.excerpt}
                        </p>
                      )}
                      <div className="flex items-center gap-2 text-xs text-[#666666] dark:text-[#999999]">
                        <span>{article.readTime} MIN READ</span>
                        <span>·</span>
                        <span>{article.editor.name}</span>
                      </div>
                    </>
                  )}
                </Link>
                {index < leftColumnArticles.length - 1 && (
                  <div className="divider mt-4" />
                )}
              </article>
            ))}
          </div>

          {/* Center Column - Large Featured Image */}
          <div className="lg:col-span-4">
            {centerArticle && (
              <Link href={`/article/${centerArticle.slug}`} className="group block">
                {centerArticle.featuredImage && (
                  <div className="relative w-full h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden image-frame mb-4">
                    <Image
                      src={centerArticle.featuredImage}
                      alt={centerArticle.title}
                      fill
                      priority
                      className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 33vw"
                    />
                  </div>
                )}
                <h2 className="font-serif font-bold text-2xl md:text-3xl leading-tight mb-3 text-black dark:text-white group-hover:underline">
                  {centerArticle.title}
                </h2>
                {centerArticle.excerpt && (
                  <p className="text-base text-[#666666] dark:text-[#999999] mb-3">
                    {centerArticle.excerpt}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-[#666666] dark:text-[#999999]">
                  <span>{centerArticle.readTime} MIN READ</span>
                  <span>·</span>
                  <span>{centerArticle.editor.name}</span>
                  <span>·</span>
                  <Link href={`/category/${centerArticle.category.slug}`} className="hover:underline">
                    {centerArticle.category.name}
                  </Link>
                </div>
              </Link>
            )}
          </div>

          {/* Right Column - Sidebar */}
          <div className="lg:col-span-3 border-t lg:border-t-0 lg:border-l border-border pt-6 lg:pt-0 lg:pl-6">
            {/* Featured Section */}
            {rightColumnArticles.length > 0 && rightColumnArticles[0]?.featuredImage && (
              <div className="mb-8">
                <h3 className="text-[11px] tracking-wide uppercase text-[#666666] dark:text-[#999999] mb-4 font-bold">
                  Featured
                </h3>
                <Link href={`/article/${rightColumnArticles[0].slug}`} className="group block mb-4">
                  <div className="relative w-full h-[200px] overflow-hidden image-frame mb-3">
                    <Image
                      src={rightColumnArticles[0].featuredImage}
                      alt={rightColumnArticles[0].title}
                      fill
                      loading="lazy"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 25vw"
                    />
                  </div>
                  <h4 className="font-serif font-bold text-base leading-tight text-black dark:text-white group-hover:underline mb-2">
                    {rightColumnArticles[0].title}
                  </h4>
                  <div className="text-xs text-[#666666] dark:text-[#999999]">
                    {rightColumnArticles[0].readTime} MIN READ
                  </div>
                </Link>
              </div>
            )}

            {/* Side-by-side articles */}
            {rightColumnArticles.length > 1 && (
              <div className="space-y-6">
                {rightColumnArticles.slice(1, 3).map((article) => (
                  <article key={article.id} className="group">
                    <Link href={`/article/${article.slug}`} className="block">
                      {article.featuredImage && (
                        <div className="relative w-full h-[120px] overflow-hidden image-frame mb-2">
                          <Image
                            src={article.featuredImage}
                            alt={article.title}
                            fill
                            loading="lazy"
                            className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                            sizes="(max-width: 1024px) 100vw, 25vw"
                          />
                        </div>
                      )}
                      <h4 className="font-serif font-bold text-sm leading-tight text-black dark:text-white group-hover:underline mb-1">
                        {article.title}
                      </h4>
                      <div className="text-xs text-[#666666] dark:text-[#999999]">
                        {article.readTime} MIN READ
                      </div>
                    </Link>
                  </article>
                ))}
              </div>
            )}

            {/* More articles list */}
            {rightColumnArticles.length > 3 && (
              <div className="mt-8 pt-6 border-t border-border">
                <div className="space-y-4">
                  {rightColumnArticles.slice(3).map((article) => (
                    <article key={article.id} className="group">
                      <Link href={`/article/${article.slug}`} className="block">
                        <h4 className="font-serif font-bold text-sm leading-tight text-black dark:text-white group-hover:underline mb-1">
                          {article.title}
                        </h4>
                        <div className="text-xs text-[#666666] dark:text-[#999999]">
                          {article.readTime} MIN READ
                        </div>
                      </Link>
                    </article>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

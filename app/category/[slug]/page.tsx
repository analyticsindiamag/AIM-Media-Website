import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { ArticleCard } from '@/components/article-card'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static params for all categories
export async function generateStaticParams() {
  const categories = await prisma.category.findMany({
    select: { slug: true },
  })

  return categories.map((category) => ({
    slug: category.slug,
  }))
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

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-12">
        {/* Category Header */}
        <div className="mb-12">
          <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight mb-4">
            {category.name}
          </h1>
          {category.description && (
            <p className="text-xl text-muted-foreground">{category.description}</p>
          )}
        </div>

        {/* Articles Grid */}
        {articles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {articles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                size="small"
                showExcerpt={false}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg">
              No articles found in this category yet.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}


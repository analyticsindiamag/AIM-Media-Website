import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { format } from 'date-fns'
import { Twitter, Mail } from 'lucide-react'
import { getArticleUrl } from '@/lib/article-url'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

// Generate static params for all editors
export async function generateStaticParams() {
  try {
    const editors = await prisma.editor.findMany({
      select: { slug: true },
    })

    return editors.map((editor) => ({
      slug: editor.slug,
    }))
  } catch (error) {
    // During build, database might not be available
    // Return empty array to allow build to continue
    console.warn('Failed to generate static params for editor/[slug]:', error)
    return []
  }
}

// Generate metadata
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const editor = await prisma.editor.findUnique({
    where: { slug },
  })

  if (!editor) {
    return {
      title: 'Editor Not Found',
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'
  return {
    title: editor.name,
    description: editor.bio || `Articles by ${editor.name}`,
    alternates: {
      canonical: `/editor/${slug}`,
    },
    openGraph: {
      type: 'profile',
      url: `${baseUrl}/editor/${slug}`,
      title: editor.name,
      description: editor.bio || `Articles by ${editor.name}`,
      images: editor.avatar ? [{ url: editor.avatar }] : [],
    },
    twitter: {
      card: 'summary',
      title: editor.name,
      description: editor.bio || `Articles by ${editor.name}`,
    },
  }
}

// Revalidate every 60 seconds
export const revalidate = 60

export default async function EditorPage({ params }: PageProps) {
  const { slug } = await params
  
  const [editor, articles] = await Promise.all([
    prisma.editor.findUnique({
      where: { slug },
    }),
    prisma.article.findMany({
      where: {
        published: true,
        editor: {
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

  if (!editor) {
    notFound()
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  // Person Schema for Editor
  const personSchema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: editor.name,
    url: `${baseUrl}/editor/${editor.slug}`,
    image: editor.avatar || undefined,
    description: editor.bio || undefined,
    email: editor.email || undefined,
    jobTitle: 'Reporter',
    worksFor: {
      '@type': 'Organization',
      name: 'AI Tech News',
    },
    sameAs: [], // Can be populated with social media URLs
  }

  return (
    <>
      {/* Person Schema JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(personSchema),
        }}
      />
      <div className="bg-white min-h-screen">
      <div className="wsj-container py-8 md:py-12">
        {/* Editor Header - WSJ Style */}
        <div className="mb-12 pb-8 border-b border-[var(--wsj-border-light)]">
          <div className="flex flex-col md:flex-row gap-6 md:gap-8">
            {/* Profile Picture - Circular */}
            {editor.avatar && (
              <div className="wsj-editor-avatar">
                <Image
                  src={editor.avatar}
                  alt={editor.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 128px, 160px"
                />
              </div>
            )}
            
            {/* Editor Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <h1 className="wsj-editor-name">
                  {editor.name}
                </h1>
                <button className="wsj-button-outline text-[var(--wsj-font-size-sm)]">
                  Follow
                </button>
              </div>
              
              {/* Title */}
              <p className="wsj-editor-title">
                Reporter, The Wall Street Journal
              </p>
              
              {/* Contact Icons */}
              <div className="flex items-center gap-4 mt-4">
                {editor.email && (
                  <a 
                    href={`mailto:${editor.email}`}
                    className="text-[var(--wsj-text-black)] hover:text-[var(--wsj-text-medium-gray)] transition-colors"
                    aria-label="Email"
                  >
                    <Mail className="w-5 h-5" />
                  </a>
                )}
                <a 
                  href={`https://twitter.com/${editor.name.replace(/\s+/g, '').toLowerCase()}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[var(--wsj-text-black)] hover:text-[var(--wsj-text-medium-gray)] transition-colors"
                  aria-label="Twitter"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              </div>
              
              {/* Biography */}
              {editor.bio && (
                <div className="wsj-editor-bio">
                  {editor.bio}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Latest Articles Section */}
        {articles.length > 0 && (
          <div>
            <div className="wsj-divider-thick mb-6"></div>
            <h2 className="text-[var(--wsj-font-size-sm)] tracking-wide uppercase text-[var(--wsj-text-medium-gray)] mb-8 font-sans font-bold">
              LATEST ARTICLES
            </h2>
            
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
                      {/* Category */}
                      <div className="text-[var(--wsj-font-size-xs)] uppercase text-[var(--wsj-text-medium-gray)] mb-2 font-sans font-medium">
                        {article.category.name}
                      </div>
                      
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
                      
                      {/* Author and Date */}
                      <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans italic">
                        By <Link href={`/editor/${article.editor.slug}`} className="hover:underline">{article.editor.name}</Link>
                        {article.publishedAt && (
                          <>
                            {' · '}
                            {format(article.publishedAt, 'MMMM d, yyyy')}
                          </>
                        )}
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
          </div>
        )}

        {/* No Articles */}
        {articles.length === 0 && (
          <div className="text-center py-20">
            <p className="text-[var(--wsj-text-medium-gray)] text-lg font-sans">
              No articles published by this editor yet.
            </p>
          </div>
        )}
      </div>
      </div>
    </>
  )
}

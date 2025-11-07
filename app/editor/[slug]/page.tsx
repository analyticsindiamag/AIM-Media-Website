import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import type { Metadata } from 'next'
import { format } from 'date-fns'
import { Twitter, Mail, Linkedin } from 'lucide-react'
import { getArticleUrl } from '@/lib/article-url'
import { AdBannerFetcher } from '@/components/ad-banner-fetcher'

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
      images: (editor.image || editor.avatar) ? [{ url: editor.image || editor.avatar }] : [],
    },
    twitter: {
      card: 'summary',
      title: editor.name,
      description: editor.bio || `Articles by ${editor.name}`,
    },
  }
}

// Revalidate every 60 seconds (set to 0 for development to disable caching)
export const revalidate = 0

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
        featuredImageMedia: {
          select: { id: true },
        },
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
    image: (editor.image || editor.avatar) || undefined,
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
          {/* Two Column Layout: Main Content + Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="w-full">
              {/* Editor Header - WSJ Style */}
              <div className="mb-12 pb-8 border-b border-[var(--wsj-border-light)]">
                <div className="flex flex-col items-center text-center">
                  {/* Profile Picture - Circular */}
                  {(editor.image || editor.avatar) && (
                    <div className="wsj-editor-avatar mb-6">
                      <Image
                        src={editor.image || editor.avatar || ''}
                        alt={editor.name}
                        fill
                        className="object-cover"
                        sizes="160px"
                        priority
                      />
                    </div>
                  )}
                  
                  {/* Editor Info */}
                  <div className="w-full max-w-2xl">
                    {/* Name and Follow Button */}
                    <div className="flex items-center justify-center gap-3 mb-3">
                      <h1 className="font-serif font-bold text-[40px] md:text-[48px] leading-[1.1] text-[var(--wsj-text-black)]">
                        {editor.name}
                      </h1>
                      <button className="inline-flex items-center px-3 py-1 border border-[var(--wsj-text-black)] text-[var(--wsj-text-black)] text-[11px] font-sans font-bold rounded hover:bg-[var(--wsj-text-black)] hover:text-white transition-colors">
                        Follow
                      </button>
                    </div>
                    
                    {/* Title */}
                    <p className="text-[15px] text-[var(--wsj-text-medium-gray)] mb-6 font-sans">
                      {editor.title || 'Reporter, AIM MEDIA HOUSE'}
                    </p>
                    
                    {/* Contact Icons */}
                    <div className="flex items-center justify-center gap-4 mb-8">
                      {editor.twitter && (
                        <a 
                          href={editor.twitter.startsWith('http') ? editor.twitter : `https://twitter.com/${editor.twitter.replace('@', '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--wsj-text-black)] hover:text-[var(--wsj-text-medium-gray)] transition-colors"
                          aria-label="Twitter/X"
                        >
                          <Twitter className="w-[18px] h-[18px]" />
                        </a>
                      )}
                      {editor.email && (
                        <a 
                          href={`mailto:${editor.email}`}
                          className="text-[var(--wsj-text-black)] hover:text-[var(--wsj-text-medium-gray)] transition-colors"
                          aria-label="Email"
                        >
                          <Mail className="w-[18px] h-[18px]" />
                        </a>
                      )}
                      {editor.linkedin && (
                        <a 
                          href={editor.linkedin.startsWith('http') ? editor.linkedin : `https://linkedin.com/in/${editor.linkedin}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[var(--wsj-text-black)] hover:text-[var(--wsj-text-medium-gray)] transition-colors"
                          aria-label="LinkedIn"
                        >
                          <Linkedin className="w-[18px] h-[18px]" />
                        </a>
                      )}
                    </div>
                    
                    {/* Biography */}
                    {editor.bio && (
                      <div className="text-left text-[15px] leading-[1.6] text-[var(--wsj-text-medium-gray)] font-sans max-w-[680px] mx-auto">
                        {editor.bio.split('\n\n').map((paragraph, idx) => (
                          <p key={idx} className="mb-5 last:mb-0">
                            {paragraph}
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Latest Articles Section */}
              {articles.length > 0 && (
                <div>
                  <h2 className="text-[13px] tracking-[0.08em] uppercase text-[var(--wsj-text-black)] mb-6 font-sans font-bold border-t border-[var(--wsj-border-light)] pt-6">
                    LATEST ARTICLES
                  </h2>
                  
                  <div className="space-y-0">
                    {articles.map((article, idx) => {
                      const articleUrl = getArticleUrl(article)
                      const articleImageUrl = article.featuredImageMediaId
                        ? `${baseUrl}/api/media/${article.featuredImageMediaId}`
                        : article.featuredImage || null
                      return (
                      <article key={article.id} className="group py-6 border-b border-[var(--wsj-border-light)] last:border-b-0">
                        <div className="flex flex-col md:flex-row gap-5">
                          {/* Article Image */}
                          {articleImageUrl && (
                            <Link href={articleUrl} className="block relative w-full md:w-[260px] h-[180px] md:h-[145px] flex-shrink-0 overflow-hidden">
                              <Image
                                src={articleImageUrl}
                                alt={article.featuredImageAltText || article.title}
                                fill
                                loading={idx < 3 ? "eager" : "lazy"}
                                className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                                sizes="(max-width: 768px) 100vw, 260px"
                              />
                            </Link>
                          )}
                          
                          {/* Article Content */}
                          <div className="flex-1">
                            {/* Category */}
                            <div className="text-[11px] uppercase text-[var(--wsj-text-medium-gray)] mb-2 font-sans font-bold tracking-[0.08em]">
                              {article.category.name}
                            </div>
                            
                            {/* Title */}
                            <Link href={articleUrl}>
                              <h3 className="font-serif font-bold text-[24px] leading-[1.25] text-[var(--wsj-text-black)] group-hover:underline mb-3">
                                {article.title}
                              </h3>
                            </Link>
                            
                            {/* Excerpt */}
                            {article.excerpt && (
                              <p className="text-[15px] text-[var(--wsj-text-medium-gray)] mb-3 font-sans leading-[1.5] line-clamp-2">
                                {article.excerpt}
                              </p>
                            )}
                            
                            {/* Author and Date */}
                            <div className="text-[13px] text-[var(--wsj-text-medium-gray)] font-sans">
                              By <Link href={`/editor/${article.editor.slug}`} className="text-[var(--wsj-text-black)] hover:underline">{article.editor.name}</Link>
                              {article.publishedAt && (
                                <>
                                  {' and '}
                                  <span>
                                    {format(article.publishedAt, 'MMMM d, yyyy')}
                                  </span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
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

            {/* Right Sidebar - Sponsored Content */}
            <aside className="hidden lg:block">
              <div className="sticky top-4 space-y-6">
                <div className="text-[var(--wsj-font-size-xs)] uppercase text-[var(--wsj-text-medium-gray)] font-sans font-bold tracking-wide mb-4">
                  Advertisement
                </div>
                <AdBannerFetcher type="article-side" />
              </div>
            </aside>
          </div>
        </div>
      </div>
    </>
  )
}

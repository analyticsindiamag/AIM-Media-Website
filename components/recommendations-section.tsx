"use client"

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { useSession } from 'next-auth/react'
import { getArticleUrl } from '@/lib/article-url'

interface Article {
  id: string
  title: string
  slug: string
  excerpt: string | null
  featuredImage: string | null
  publishedAt: Date | null
  readTime: number
  category: { name: string; slug: string }
  editor: { name: string; slug: string }
  featuredImageMediaId: string | null
}

interface RecommendationsSectionProps {
  className?: string
}

export function RecommendationsSection({ className = '' }: RecommendationsSectionProps) {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [isRecommended, setIsRecommended] = useState(false)
  const { data: session } = useSession()
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        const response = await fetch('/api/recommendations')
        if (response.ok) {
          const data = await response.json()
          setArticles(data.articles || [])
          setIsRecommended(data.isRecommended || false)
        }
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchRecommendations()
  }, [session])

  if (loading) {
    return (
      <div className={`mb-12 ${className}`}>
        <h2 className="font-serif font-bold text-[var(--wsj-font-size-2xl)] mb-6 text-[var(--wsj-text-black)]">
          {session ? 'Recommended for you' : 'Trending'}
        </h2>
        <div className="text-[var(--wsj-text-medium-gray)] font-sans">Loading...</div>
      </div>
    )
  }

  if (articles.length === 0) {
    return null
  }

  return (
    <div className={`mb-12 ${className}`}>
      <h2 className="font-serif font-bold text-[var(--wsj-font-size-2xl)] mb-6 text-[var(--wsj-text-black)]">
        {session && isRecommended ? 'Recommended for you' : 'Trending'}
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {articles.map((article) => {
          const articleUrl = getArticleUrl(article)
          const articleImageUrl = article.featuredImageMediaId
            ? `${baseUrl}/api/media/${article.featuredImageMediaId}`
            : article.featuredImage || null
          
          return (
            <article key={article.id} className="group">
              <Link href={articleUrl} className="block">
                {articleImageUrl && (
                  <div className="relative w-full h-[200px] overflow-hidden mb-4">
                    <Image
                      src={articleImageUrl}
                      alt={article.title}
                      fill
                      loading="lazy"
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                  </div>
                )}
                <h3 className="font-serif font-bold text-xl leading-tight text-[var(--wsj-text-black)] group-hover:underline mb-2">
                  {article.title}
                </h3>
                {article.excerpt && (
                  <p className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-dark-gray)] line-clamp-2 mb-3 font-serif">
                    {article.excerpt}
                  </p>
                )}
                <div className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
                  {article.publishedAt && format(new Date(article.publishedAt), 'MMM d, yyyy')}
                  {article.publishedAt && ' · '}
                  <Link href={`/editor/${article.editor.slug}`} className="hover:underline">
                    {article.editor.name}
                  </Link>
                  {' · '}
                  {article.readTime} min read
                </div>
              </Link>
            </article>
          )
        })}
      </div>
    </div>
  )
}


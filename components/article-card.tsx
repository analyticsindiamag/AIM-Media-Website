import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'
import { MessageCircle, Clock } from 'lucide-react'
import { getArticleUrl } from '@/lib/article-url'

interface ArticleCardProps {
  article: {
    slug: string
    title: string
    excerpt?: string | null
    featuredImage?: string | null
    publishedAt?: Date | null
    readTime?: number | null
    category: {
      name: string
      slug: string
    }
    editor: {
      name: string
      slug?: string
    }
  }
  size?: 'small' | 'medium' | 'large'
  showExcerpt?: boolean
}

export function ArticleCard({ article, size = 'medium', showExcerpt = false }: ArticleCardProps) {
  const imageHeight = size === 'large' ? 'h-[420px]' : size === 'medium' ? 'h-[260px] md:h-[300px]' : 'h-[180px] md:h-[200px]'
  const titleSize = size === 'large' 
    ? 'text-[var(--wsj-font-size-4xl)] md:text-[var(--wsj-font-size-5xl)]' 
    : size === 'medium' 
    ? 'text-[var(--wsj-font-size-2xl)] md:text-[var(--wsj-font-size-3xl)]' 
    : 'text-[var(--wsj-font-size-xl)] md:text-[var(--wsj-font-size-2xl)]'

  const articleUrl = getArticleUrl(article)

  return (
    <article className="wsj-article-card group">
      <Link href={articleUrl} className="block">
        {article.featuredImage && (
          <div className={`relative w-full overflow-hidden mb-4 image-frame ${imageHeight}`}>
            <Image
              src={article.featuredImage}
              alt={article.featuredImageAltText || article.title}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes={size === 'large' ? '100vw' : size === 'medium' ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 25vw'}
            />
          </div>
        )}

        <h2 className={`font-serif font-bold leading-[var(--wsj-line-height-tight)] ${titleSize} text-[var(--wsj-text-black)] group-hover:underline mb-2`}>
          {article.title}
        </h2>

        {showExcerpt && article.excerpt && (
          <p className="text-[var(--wsj-font-size-md)] text-[var(--wsj-text-dark-gray)] line-clamp-3 mb-3 font-serif leading-[var(--wsj-line-height-loose)]">
            {article.excerpt}
          </p>
        )}

        <div className="wsj-article-card-meta">
          {article.publishedAt && (
            <>
              <span>{format(article.publishedAt, 'MMM d, yyyy')}</span>
              <span className="text-[var(--wsj-border-light)]">·</span>
            </>
          )}
          {article.editor?.slug ? (
            <Link 
              href={`/editor/${article.editor.slug}`} 
              className="hover:underline"
            >
              {article.editor.name}
            </Link>
          ) : (
            <span>{article.editor?.name}</span>
          )}
          {' · '}
          <Link 
            href={`/category/${article.category?.slug}`} 
            className="hover:underline"
          >
            {article.category?.name}
          </Link>
          {article.readTime && (
            <>
              <span className="text-[var(--wsj-border-light)]">·</span>
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{article.readTime} min read</span>
              </div>
            </>
          )}
        </div>
      </Link>
      <div className="wsj-divider mt-6" />
    </article>
  )
}

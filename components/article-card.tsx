import Link from 'next/link'
import Image from 'next/image'
import { format } from 'date-fns'

interface ArticleCardProps {
  article: {
    slug: string
    title: string
    excerpt?: string | null
    featuredImage?: string | null
    publishedAt?: Date | null
    category: {
      name: string
      slug: string
    }
    editor: {
      name: string
    }
  }
  size?: 'small' | 'medium' | 'large'
  showExcerpt?: boolean
}

export function ArticleCard({ article, size = 'medium', showExcerpt = false }: ArticleCardProps) {
  const imageHeight = size === 'large' ? 'h-[420px]' : size === 'medium' ? 'h-[260px] md:h-[300px]' : 'h-[180px] md:h-[200px]'
  const titleSize = size === 'large' ? 'text-3xl md:text-4xl' : size === 'medium' ? 'text-2xl md:text-3xl' : 'text-xl md:text-2xl'

  return (
    <article className="group">
      <Link href={`/article/${article.slug}`} className="block">
        {article.featuredImage && (
          <div className={`relative w-full overflow-hidden mb-4 image-frame ${imageHeight}`}>
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              loading="lazy"
              className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              sizes={size === 'large' ? '100vw' : size === 'medium' ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 100vw, 25vw'}
            />
          </div>
        )}

        <h2 className={`font-serif font-bold leading-tight ${titleSize} text-black dark:text-white group-hover:underline mb-2`}>
          {article.title}
        </h2>

        {showExcerpt && article.excerpt && (
          <p className="mt-2 text-[#666666] dark:text-[#999999] text-base md:text-lg line-clamp-3 mb-3">
            {article.excerpt}
          </p>
        )}

        <div className="text-[13px] text-[#666666] dark:text-[#999999]">
          {article.publishedAt && format(article.publishedAt, 'MMM d, yyyy')}
          {article.publishedAt && ' · '}
          {article.editor?.name}
          {' · '}
          <Link 
            href={`/category/${article.category?.slug}`} 
            className="hover:underline"
          >
            {article.category?.name}
          </Link>
        </div>
      </Link>
      <div className="divider mt-6" />
    </article>
  )
}


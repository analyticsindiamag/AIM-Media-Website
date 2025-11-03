import Link from 'next/link'
import Image from 'next/image'

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
  const imageHeight = size === 'large' ? 'h-[420px]' : size === 'medium' ? 'h-[260px]' : 'h-[180px]'
  const titleSize = size === 'large' ? 'text-3xl md:text-4xl' : size === 'medium' ? 'text-2xl' : 'text-xl'

  return (
    <article className="group">
      <Link href={`/article/${article.slug}`} className="block">
        {article.featuredImage && (
          <div className={`relative w-full overflow-hidden mb-3 image-frame ${imageHeight}`}>
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          </div>
        )}

        <h2 className={`font-serif font-bold leading-tight ${titleSize} group-hover:underline`}>{article.title}</h2>

        {showExcerpt && article.excerpt && (
          <p className="mt-2 text-[var(--muted-foreground)] line-clamp-3">{article.excerpt}</p>
        )}

        <div className="mt-2 text-xs text-[var(--muted-foreground)]">
          {article.editor?.name ? `${article.editor.name} · ` : ''}
          {article.category?.name}
          {article.publishedAt ? ` · ${new Date(article.publishedAt).toLocaleDateString()}` : ''}
        </div>
      </Link>
      <div className="divider mt-4" />
    </article>
  )
}


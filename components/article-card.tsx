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
  return (
    <article className="group">
      <Link href={`/article/${article.slug}`}>
        {/* Featured Image */}
        {article.featuredImage && (
          <div className={`relative w-full overflow-hidden rounded-lg mb-4 ${
            size === 'large' ? 'h-[500px]' : size === 'medium' ? 'h-[300px]' : 'h-[200px]'
          }`}>
            <Image
              src={article.featuredImage}
              alt={article.title}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
            {/* Logo overlay */}
            <div className="absolute top-4 left-4">
              <div className="bg-black text-white px-2 py-1 text-xs font-black">
                AI TECH
              </div>
            </div>
          </div>
        )}

        {/* Title */}
        <h2 className={`font-serif font-bold leading-tight group-hover:text-primary transition-colors ${
          size === 'large' ? 'text-3xl md:text-4xl' : size === 'medium' ? 'text-2xl' : 'text-xl'
        }`}>
          {article.title}
        </h2>

        {/* Excerpt */}
        {showExcerpt && article.excerpt && (
          <p className="mt-3 text-muted-foreground line-clamp-3">
            {article.excerpt}
          </p>
        )}

        {/* Meta */}
        {article.publishedAt && (
          <div className="mt-3 text-sm text-muted-foreground">
            {article.editor.name}
          </div>
        )}
      </Link>
    </article>
  )
}


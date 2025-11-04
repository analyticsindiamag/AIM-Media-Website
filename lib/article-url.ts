/**
 * Utility functions for generating article URLs in WordPress permalink format
 * Format: /{category-slug}/{article-slug}
 */

export function getArticleUrl(article: { slug: string; category: { slug: string } }): string {
  return `/${article.category.slug}/${article.slug}`
}

export function getArticleUrlFromSlug(slug: string, categorySlug: string): string {
  return `/${categorySlug}/${slug}`
}


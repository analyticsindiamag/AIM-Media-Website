/**
 * WordPress Field Mapper
 * Maps WordPress REST API data to our database schema
 */

import type {
  WordPressUser,
  WordPressCategory,
  WordPressPost,
  WordPressMedia,
} from './wordpress-api-client'

/**
 * Convert string to slug format
 */
export function toSlug(s: string): string {
  return s
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Decode HTML entities in text
 * Handles both named entities (&amp;, &quot;) and numeric entities (&#8217;, &#8220;)
 * Works for both plain text and HTML content (preserves HTML structure)
 */
export function decodeHtmlEntities(text: string): string {
  if (!text) return text
  
  // First decode numeric entities (&#8217;, &#8220;, etc.)
  // These are decimal entities like &#8217; (right single quotation mark)
  let decoded = text.replace(/&#(\d+);/g, (match, dec) => {
    const code = parseInt(dec, 10)
    // Handle common WordPress entities
    // 8217 = right single quotation mark (')
    // 8220 = left double quotation mark (")
    // 8221 = right double quotation mark (")
    // 8211 = en dash (–)
    // 8212 = em dash (—)
    return String.fromCharCode(code)
  })
  
  // Then decode hex entities (&#x27;, etc.)
  decoded = decoded.replace(/&#x([0-9a-fA-F]+);/gi, (match, hex) => {
    return String.fromCharCode(parseInt(hex, 16))
  })
  
  // Finally decode named entities (must be last to avoid double-decoding)
  // Common WordPress entities
  const entityMap: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&apos;': "'",
    '&nbsp;': ' ',
    '&copy;': '©',
    '&reg;': '®',
    '&trade;': '™',
    '&hellip;': '…',
    '&mdash;': '—',
    '&ndash;': '–',
    '&lsquo;': '‘',
    '&rsquo;': '’',
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&lsaquo;': '‹',
    '&rsaquo;': '›',
    '&laquo;': '«',
    '&raquo;': '»',
  }
  
  for (const [entity, char] of Object.entries(entityMap)) {
    // Use word boundary or semicolon to avoid partial matches
    decoded = decoded.replace(new RegExp(entity.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), char)
  }
  
  return decoded
}

/**
 * Strip HTML tags from text and decode HTML entities
 */
export function stripHtml(html: string): string {
  const stripped = html.replace(/<[^>]*>/g, '').trim()
  return decodeHtmlEntities(stripped)
}

/**
 * Calculate read time from content (200 words per minute)
 */
export function calculateReadTime(content: string): number {
  const textContent = stripHtml(content)
  const wordCount = textContent.split(/\s+/).filter(Boolean).length
  return Math.max(1, Math.ceil(wordCount / 200))
}

/**
 * Map WordPress user to Editor data
 */
export interface EditorData {
  name: string
  email: string
  slug: string
  bio?: string
  avatar?: string
}

export function mapWordPressUserToEditor(user: WordPressUser): EditorData {
  // Email is required - generate if missing
  const email = user.email || `${user.slug}@wordpress-migrated.local`
  
  // Generate slug if missing
  const slug = user.slug || toSlug(user.name) || `user-${user.id}`
  
  // Get avatar URL (prefer 96px, fallback to 48px or 24px)
  const avatarUrl = user.avatar_urls?.['96'] || 
                    user.avatar_urls?.['48'] || 
                    user.avatar_urls?.['24'] || 
                    undefined

  return {
    name: decodeHtmlEntities(user.name),
    email,
    slug,
    bio: user.description ? decodeHtmlEntities(user.description) : undefined,
    avatar: avatarUrl,
  }
}

/**
 * Map WordPress category to Category data
 */
export interface CategoryData {
  name: string
  slug: string
  description?: string
}

export function mapWordPressCategoryToCategory(category: WordPressCategory): CategoryData {
  const decodedName = decodeHtmlEntities(category.name)
  return {
    name: decodedName,
    slug: category.slug || toSlug(decodedName),
    description: category.description ? decodeHtmlEntities(category.description) : undefined,
  }
}

/**
 * Map WordPress post to Article data
 */
export interface ArticleData {
  title: string
  slug: string
  excerpt?: string
  content: string
  published: boolean
  publishedAt?: Date
  scheduledAt?: Date
  featuredImage?: string
  featuredImageTitle?: string
  featuredImageCaption?: string
  featuredImageDescription?: string
  featuredImageAltText?: string
  metaTitle?: string
  metaDescription?: string
  readTime: number
  featured: boolean
}

export function mapWordPressPostToArticle(
  post: WordPressPost,
  media?: WordPressMedia | null
): ArticleData {
  // Parse status
  const isPublished = post.status === 'publish'
  const isScheduled = post.status === 'future'
  
  // Parse dates
  const publishedAt = isPublished ? new Date(post.date) : undefined
  const scheduledAt = isScheduled ? new Date(post.date) : undefined

  // Extract title (strip HTML and decode HTML entities)
  const title = stripHtml(post.title.rendered)

  // Extract excerpt (strip HTML, decode entities, limit length)
  const excerptHtml = stripHtml(post.excerpt.rendered)
  const excerpt = excerptHtml.length > 500 ? excerptHtml.substring(0, 500) : excerptHtml

  // Content is HTML, decode entities but keep HTML structure
  const content = decodeHtmlEntities(post.content.rendered)

  // Featured image handling
  const featuredImage = media?.source_url || undefined
  const featuredImageTitle = media?.title?.rendered ? stripHtml(media.title.rendered) : undefined
  const featuredImageCaption = media?.caption?.rendered ? stripHtml(media.caption.rendered) : undefined
  const featuredImageDescription = media?.description?.rendered ? stripHtml(media.description.rendered) : undefined
  const featuredImageAltText = media?.alt_text ? decodeHtmlEntities(media.alt_text) : undefined

  // SEO meta fields
  const metaTitle = post.meta?._yoast_wpseo_title ? decodeHtmlEntities(post.meta._yoast_wpseo_title) : undefined
  const metaDescription = post.meta?._yoast_wpseo_metadesc ? decodeHtmlEntities(post.meta._yoast_wpseo_metadesc) : undefined

  // Calculate read time
  const readTime = calculateReadTime(content)

  // Featured flag (sticky posts)
  const featured = post.sticky === true

  return {
    title,
    slug: post.slug,
    excerpt: excerpt || undefined,
    content,
    published: isPublished,
    publishedAt,
    scheduledAt,
    featuredImage,
    featuredImageTitle,
    featuredImageCaption,
    featuredImageDescription,
    featuredImageAltText,
    metaTitle,
    metaDescription,
    readTime,
    featured,
  }
}

/**
 * Validate WordPress user data
 */
export function validateWordPressUser(user: WordPressUser): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!user.name || user.name.trim().length === 0) {
    errors.push('User name is required')
  }

  if (user.name && user.name.length > 200) {
    errors.push('User name is too long (max 200 characters)')
  }

  if (user.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email)) {
    errors.push('Invalid email format')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate WordPress category data
 */
export function validateWordPressCategory(category: WordPressCategory): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!category.name || category.name.trim().length === 0) {
    errors.push('Category name is required')
  }

  if (category.name && category.name.length > 100) {
    errors.push('Category name is too long (max 100 characters)')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

/**
 * Validate WordPress post data
 */
export function validateWordPressPost(post: WordPressPost): { valid: boolean; errors: string[] } {
  const errors: string[] = []

  if (!post.title?.rendered || stripHtml(post.title.rendered).trim().length === 0) {
    errors.push('Post title is required')
  }

  if (post.title?.rendered && stripHtml(post.title.rendered).length > 500) {
    errors.push('Post title is too long (max 500 characters)')
  }

  if (!post.content?.rendered || post.content.rendered.trim().length === 0) {
    errors.push('Post content is required')
  }

  if (post.content?.rendered && stripHtml(post.content.rendered).length < 10) {
    errors.push('Post content is too short (minimum 10 characters)')
  }

  if (post.content?.rendered && post.content.rendered.length > 1000000) {
    errors.push('Post content is too long (max 1,000,000 characters)')
  }

  if (!post.slug || post.slug.trim().length === 0) {
    errors.push('Post slug is required')
  }

  if (post.slug && post.slug.length > 200) {
    errors.push('Post slug is too long (max 200 characters)')
  }

  if (post.excerpt?.rendered) {
    const excerptText = stripHtml(post.excerpt.rendered)
    if (excerptText.length > 500) {
      errors.push('Post excerpt is too long (max 500 characters)')
    }
  }

  if (post.meta?._yoast_wpseo_title && stripHtml(post.meta._yoast_wpseo_title).length > 60) {
    errors.push('Meta title is too long (max 60 characters recommended)')
  }

  if (post.meta?._yoast_wpseo_metadesc && stripHtml(post.meta._yoast_wpseo_metadesc).length > 160) {
    errors.push('Meta description is too long (max 160 characters recommended)')
  }

  // Validate date
  if (post.date) {
    const date = new Date(post.date)
    if (isNaN(date.getTime())) {
      errors.push(`Invalid date format: ${post.date}`)
    } else {
      const maxDate = new Date()
      maxDate.setFullYear(maxDate.getFullYear() + 1)
      if (date > maxDate) {
        errors.push(`Date is too far in the future: ${post.date}`)
      }
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}


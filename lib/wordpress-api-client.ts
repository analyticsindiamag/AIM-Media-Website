/**
 * WordPress REST API Client
 * Handles fetching data from WordPress REST API with pagination and rate limiting
 */

export interface WordPressConfig {
  baseUrl: string
  username?: string
  password?: string
  timeout?: number
}

export interface WordPressUser {
  id: number
  name: string
  slug: string
  email?: string
  description?: string
  avatar_urls?: {
    '24'?: string
    '48'?: string
    '96'?: string
  }
}

export interface WordPressCategory {
  id: number
  name: string
  slug: string
  description?: string
}

export interface WordPressMedia {
  id: number
  source_url: string
  alt_text?: string
  title?: {
    rendered?: string
  }
  caption?: {
    rendered?: string
  }
  description?: {
    rendered?: string
  }
}

export interface WordPressPost {
  id: number
  title: {
    rendered: string
  }
  slug: string
  excerpt: {
    rendered: string
  }
  content: {
    rendered: string
  }
  status: string
  date: string
  date_gmt: string
  modified: string
  featured_media: number
  categories: number[]
  author: number
  meta?: {
    _yoast_wpseo_title?: string
    _yoast_wpseo_metadesc?: string
  }
  sticky?: boolean
}

export interface WordPressResponse<T> {
  data: T[]
  total: number
  totalPages: number
}

/**
 * Create Basic Auth header for WordPress REST API
 */
function createAuthHeader(username?: string, password?: string): string | undefined {
  if (username && password) {
    const credentials = Buffer.from(`${username}:${password}`).toString('base64')
    return `Basic ${credentials}`
  }
  return undefined
}

/**
 * Fetch data from WordPress REST API with pagination support
 */
async function fetchWithPagination<T>(
  config: WordPressConfig,
  endpoint: string,
  maxPages?: number
): Promise<T[]> {
  const results: T[] = []
  let page = 1
  let totalPages = 1

  const timeout = config.timeout || 30000
  const authHeader = createAuthHeader(config.username, config.password)

  do {
    const url = `${config.baseUrl}${endpoint}${endpoint.includes('?') ? '&' : '?'}per_page=100&page=${page}`
    
    console.log(`Fetching WordPress API: ${url}`)
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        headers,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`WordPress API error for ${url}:`, response.status, response.statusText, errorText)
        throw new Error(`WordPress API error: ${response.status} ${response.statusText} - ${errorText.substring(0, 200)}`)
      }

      const data = await response.json()
      
      // Handle single object response (when per_page=1)
      if (Array.isArray(data)) {
        results.push(...data)
      } else if (data && typeof data === 'object') {
        results.push(data)
      }

      // Get total pages from response headers
      const totalPagesHeader = response.headers.get('X-WP-TotalPages')
      if (totalPagesHeader) {
        totalPages = parseInt(totalPagesHeader, 10)
      } else {
        // If no header, check if we got less than per_page items
        totalPages = data.length < 100 ? page : page + 1
      }

      page++

      // Rate limiting: wait 200ms between requests
      if (page <= totalPages) {
        await new Promise(resolve => setTimeout(resolve, 200))
      }
    } catch (error) {
      clearTimeout(timeoutId)
      if (error instanceof Error && error.name === 'AbortError') {
        throw new Error(`Request timeout after ${timeout}ms`)
      }
      throw error
    }
  } while (page <= totalPages && (!maxPages || page <= maxPages))

  return results
}

/**
 * Fetch all users from WordPress REST API
 */
export async function fetchWordPressUsers(
  config: WordPressConfig
): Promise<WordPressUser[]> {
  return fetchWithPagination<WordPressUser>(config, '/wp/v2/users')
}

/**
 * Fetch all categories from WordPress REST API
 */
export async function fetchWordPressCategories(
  config: WordPressConfig
): Promise<WordPressCategory[]> {
  return fetchWithPagination<WordPressCategory>(config, '/wp/v2/categories')
}

/**
 * Fetch all posts from WordPress REST API
 * Note: Status filter only works with authentication. For public API, WordPress returns only published posts by default.
 */
export async function fetchWordPressPosts(
  config: WordPressConfig,
  status?: string[]
): Promise<WordPressPost[]> {
  let endpoint = '/wp/v2/posts'
  
  // Only use status filter if authentication is provided
  // WordPress REST API doesn't allow status filtering without authentication
  // For public API, WordPress returns only published posts by default
  const hasAuth = !!(config.username && config.password)
  
  if (status && status.length > 0 && hasAuth) {
    endpoint += `?status=${status.join(',')}`
  }
  // For public API, WordPress defaults to 'publish' status only
  
  return fetchWithPagination<WordPressPost>(config, endpoint)
}

/**
 * Fetch a single media item from WordPress REST API
 */
export async function fetchWordPressMedia(
  config: WordPressConfig,
  mediaId: number
): Promise<WordPressMedia | null> {
  if (!mediaId || mediaId === 0) {
    return null
  }

  const timeout = config.timeout || 30000
  const authHeader = createAuthHeader(config.username, config.password)
  const url = `${config.baseUrl}/wp/v2/media/${mediaId}`

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  }

  if (authHeader) {
    headers['Authorization'] = authHeader
  }

  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      headers,
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      if (response.status === 404) {
        return null
      }
      throw new Error(`WordPress API error: ${response.status} ${response.statusText}`)
    }

    return await response.json()
  } catch (error) {
    clearTimeout(timeoutId)
    if (error instanceof Error && error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms`)
    }
    throw error
  }
}

/**
 * Test WordPress REST API connection
 */
export async function testWordPressConnection(
  config: WordPressConfig
): Promise<{ success: boolean; message: string }> {
  try {
    const timeout = config.timeout || 10000
    const authHeader = createAuthHeader(config.username, config.password)
    
    // Try the posts endpoint first (most reliable)
    const testUrls = [
      `${config.baseUrl}/wp/v2/posts?per_page=1`,
      `${config.baseUrl}/wp/v2`,
    ]

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    }

    if (authHeader) {
      headers['Authorization'] = authHeader
    }

    let lastError: string | null = null

    for (const url of testUrls) {
      console.log(`Testing WordPress connection: ${url}`)
      const controller = new AbortController()
      const timeoutId = setTimeout(() => controller.abort(), timeout)

      try {
        const response = await fetch(url, {
          headers,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (response.ok) {
          const data = await response.json()
          console.log(`WordPress API test successful: ${url}`)
          
          // Check if this looks like a WordPress REST API response
          // Accept arrays (posts, categories, etc.) or objects (routes, etc.)
          if (Array.isArray(data) || (data && typeof data === 'object')) {
            return {
              success: true,
              message: 'Connection successful',
            }
          }
        } else {
          lastError = `${response.status} ${response.statusText}`
          console.log(`WordPress API test failed: ${url} - ${lastError}`)
          // If 404, try next URL
          if (response.status === 404 && testUrls.indexOf(url) < testUrls.length - 1) {
            continue
          }
        }
      } catch (error) {
        clearTimeout(timeoutId)
        if (error instanceof Error && error.name === 'AbortError') {
          lastError = `Connection timeout after ${timeout}ms`
          console.log(`WordPress API test timeout: ${url}`)
          continue
        }
        lastError = error instanceof Error ? error.message : 'Unknown error'
        console.log(`WordPress API test error: ${url} - ${lastError}`)
        continue
      }
    }

    return {
      success: false,
      message: lastError || 'Invalid WordPress REST API response',
    }
  } catch (error) {
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}


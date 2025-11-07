import { HfInference } from '@huggingface/inference'
import { prisma } from './prisma'

const hf = new HfInference(process.env.HUGGINGFACE_API_KEY)

const MODEL = 'sentence-transformers/all-MiniLM-L6-v2'

/**
 * Generate embedding for text using Hugging Face
 */
export async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await hf.featureExtraction({
      model: MODEL,
      inputs: text,
    })

    // Handle different response formats
    if (Array.isArray(response)) {
      return response as number[]
    }
    if (Array.isArray(response[0])) {
      return response[0] as number[]
    }
    return response as number[]
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

/**
 * Compute cosine similarity between two vectors
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length')
  }

  let dotProduct = 0
  let normA = 0
  let normB = 0

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i]
    normA += a[i] * a[i]
    normB += b[i] * b[i]
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB))
}

/**
 * Get or generate embedding for an article
 */
export async function getArticleEmbedding(articleId: string): Promise<number[]> {
  // Check if embedding exists in database
  const existing = await prisma.articleEmbedding.findUnique({
    where: { articleId },
  })

  if (existing) {
    return JSON.parse(existing.embedding) as number[]
  }

  // Generate embedding
  const article = await prisma.article.findUnique({
    where: { id: articleId },
    select: {
      title: true,
      excerpt: true,
      content: true,
    },
  })

  if (!article) {
    throw new Error('Article not found')
  }

  // Combine title, excerpt, and content for embedding
  const text = [
    article.title,
    article.excerpt || '',
    article.content.replace(/<[^>]*>/g, '').substring(0, 1000), // Strip HTML and limit length
  ]
    .filter(Boolean)
    .join(' ')

  const embedding = await generateEmbedding(text)

  // Store in database
  await prisma.articleEmbedding.upsert({
    where: { articleId },
    create: {
      articleId,
      embedding: JSON.stringify(embedding),
      model: MODEL,
    },
    update: {
      embedding: JSON.stringify(embedding),
      model: MODEL,
    },
  })

  return embedding
}

/**
 * Get recommendations based on user's viewed articles
 */
export async function getRecommendations(
  userId: string | null,
  anonymousId: string | null,
  limit: number = 8
): Promise<string[]> {
  // Get user's viewed articles
  const views = await prisma.articleView.findMany({
    where: userId ? { userId } : { anonymousId },
    include: {
      article: {
        select: { id: true },
      },
    },
    orderBy: { viewedAt: 'desc' },
    take: 10, // Use last 10 viewed articles
  })

  if (views.length === 0) {
    // No views yet, return empty array
    return []
  }

  // Get embeddings for viewed articles
  const viewedArticleIds = views.map((v) => v.article.id)
  const viewedEmbeddings = await Promise.all(
    viewedArticleIds.map((id) => getArticleEmbedding(id))
  )

  // Average the embeddings to get user preference vector
  const avgEmbedding = viewedEmbeddings.reduce(
    (acc, emb) => {
      return acc.map((val, i) => val + emb[i])
    },
    new Array(viewedEmbeddings[0].length).fill(0)
  ).map((val) => val / viewedEmbeddings.length)

  // Get all published articles (excluding viewed ones)
  const allArticles = await prisma.article.findMany({
    where: {
      published: true,
      id: { notIn: viewedArticleIds },
    },
    select: { id: true },
  })

  if (allArticles.length === 0) {
    return []
  }

  // Calculate similarity for each article
  const similarities = await Promise.all(
    allArticles.map(async (article) => {
      const embedding = await getArticleEmbedding(article.id)
      const similarity = cosineSimilarity(avgEmbedding, embedding)
      return { articleId: article.id, similarity }
    })
  )

  // Sort by similarity and return top N
  return similarities
    .sort((a, b) => b.similarity - a.similarity)
    .slice(0, limit)
    .map((item) => item.articleId)
}


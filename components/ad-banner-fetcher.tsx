import { prisma } from '@/lib/prisma'
import { AdBanner } from './ad-banner'

interface AdBannerFetcherProps {
  type: 'homepage-main' | 'homepage-side' | 'article-side' | 'article-top'
}

export async function AdBannerFetcher({ type }: AdBannerFetcherProps) {
  try {
    const now = new Date()
    
    // Use type assertion to access the model (handles cases where TS types haven't updated)
    const banner = await (prisma as any).sponsoredBanner?.findFirst({
    where: {
      type,
      active: true,
      OR: [
        { startDate: null },
        { startDate: { lte: now } }
      ],
      AND: [
        { OR: [{ endDate: null }, { endDate: { gte: now } }] }
      ]
    },
    orderBy: [
      { displayOrder: 'asc' },
      { createdAt: 'desc' }
    ],
    })

    if (!banner) {
      return null
    }

    return (
      <AdBanner
        imageUrl={banner.imageUrl}
        linkUrl={banner.linkUrl}
        type={type}
        alt={banner.title}
      />
    )
  } catch (error) {
    console.error('Error fetching ad banner:', error)
    return null
  }
}


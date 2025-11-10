import Link from 'next/link'
import Image from 'next/image'

interface AdBannerProps {
  imageUrl: string
  linkUrl?: string | null
  type: 'homepage-main' | 'homepage-side' | 'article-side' | 'article-top'
  alt?: string
}

export function AdBanner({ imageUrl, linkUrl, type, alt = 'Advertisement' }: AdBannerProps) {
  // Don't render if imageUrl is empty or invalid
  if (!imageUrl || imageUrl.trim() === '') {
    return null
  }

  const bannerContent = (
    <div className="relative w-full">
      {type === 'homepage-main' || type === 'article-top' ? (
        <div className="relative w-full h-[250px] md:h-[300px] bg-black overflow-hidden">
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-contain"
            sizes="100vw"
          />
        </div>
      ) : (
        <div className="relative w-full aspect-[9/16] max-w-[300px] mx-auto bg-black overflow-hidden">
          <Image
            src={imageUrl}
            alt={alt}
            fill
            className="object-contain"
            sizes="300px"
          />
        </div>
      )}
    </div>
  )

  if (linkUrl) {
    return (
      <Link href={linkUrl} target="_blank" rel="noopener noreferrer" className="block">
        {bannerContent}
      </Link>
    )
  }

  return bannerContent
}


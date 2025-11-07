"use client"

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface LikeButtonProps {
  articleSlug: string
  initialLikesCount?: number
  initialIsLiked?: boolean
  variant?: 'default' | 'light'
  compact?: boolean
}

export function LikeButton({
  articleSlug,
  initialLikesCount = 0,
  initialIsLiked = false,
  variant = 'default',
  compact = false,
}: LikeButtonProps) {
  const [likesCount, setLikesCount] = useState(initialLikesCount)
  const [isLiked, setIsLiked] = useState(initialIsLiked)
  const [isLoading, setIsLoading] = useState(false)
  const { data: session } = useSession()
  const router = useRouter()

  // Fetch current like status on mount
  useEffect(() => {
    const fetchLikeStatus = async () => {
      try {
        const response = await fetch(`/api/articles/by-slug/${articleSlug}/like`)
        if (response.ok) {
          const data = await response.json()
          setLikesCount(data.likesCount || 0)
          setIsLiked(data.isLiked || false)
        }
      } catch (error) {
        console.error('Error fetching like status:', error)
      }
    }
    fetchLikeStatus()
  }, [articleSlug])

  const handleLike = async () => {
    if (!session) {
      router.push('/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname))
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch(`/api/articles/by-slug/${articleSlug}/like`, {
        method: 'POST',
      })

      if (response.status === 401) {
        router.push('/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname))
        return
      }

      if (response.ok) {
        const data = await response.json()
        setLikesCount(data.likesCount)
        setIsLiked(data.liked)
      }
    } catch (error) {
      console.error('Error toggling like:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const textColorClass = variant === 'light'
    ? 'text-white hover:text-white/80'
    : 'text-[var(--wsj-text-black)] hover:text-[var(--wsj-text-medium-gray)]'

  const iconColorClass = isLiked
    ? variant === 'light'
      ? 'text-white fill-white'
      : 'text-red-600 fill-red-600'
    : textColorClass

  return (
    <button
      onClick={handleLike}
      disabled={isLoading}
      className={`flex items-center gap-1 ${textColorClass} transition-colors disabled:opacity-50`}
      aria-label={isLiked ? 'Unlike article' : 'Like article'}
    >
      <Heart className={`w-4 h-4 ${iconColorClass} transition-colors`} />
      {!compact && (
        <span className="text-[var(--wsj-font-size-sm)] font-sans">
          {likesCount}
        </span>
      )}
    </button>
  )
}


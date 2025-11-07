"use client"

import { useEffect } from 'react'

interface ArticleViewTrackerProps {
  articleSlug: string
}

export function ArticleViewTracker({ articleSlug }: ArticleViewTrackerProps) {
  useEffect(() => {
    // Track view on mount
    fetch(`/api/articles/by-slug/${articleSlug}/view`, {
      method: 'POST',
    }).catch((error) => {
      console.error('Error tracking view:', error)
    })
  }, [articleSlug])

  return null
}


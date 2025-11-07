"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

interface CommentFormProps {
  articleSlug: string
  onCommentAdded?: () => void
}

export function CommentForm({ articleSlug, onCommentAdded }: CommentFormProps) {
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/articles/by-slug/${articleSlug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content }),
      })

      if (response.status === 401) {
        // Redirect to login
        router.push('/api/auth/signin?callbackUrl=' + encodeURIComponent(window.location.pathname))
        return
      }

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || 'Failed to submit comment')
        return
      }

      setContent('')
      if (onCommentAdded) {
        onCommentAdded()
      }
      router.refresh()
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Write your comment..."
          rows={4}
          className="w-full"
          maxLength={5000}
          required
        />
        <div className="text-sm text-[var(--wsj-text-medium-gray)] mt-1 font-sans">
          {content.length}/5000 characters
        </div>
      </div>
      {error && (
        <div className="text-sm text-red-600 font-sans">{error}</div>
      )}
      <Button
        type="submit"
        disabled={isSubmitting || !content.trim()}
        className="font-sans"
      >
        {isSubmitting ? 'Submitting...' : 'Submit Comment'}
      </Button>
      <p className="text-sm text-[var(--wsj-text-medium-gray)] font-sans">
        Your comment will be reviewed before being published.
      </p>
    </form>
  )
}


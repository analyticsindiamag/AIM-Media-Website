"use client"

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import Image from 'next/image'
import { CommentForm } from './comment-form'
import { useSession } from 'next-auth/react'

interface Comment {
  id: string
  content: string
  createdAt: string
  author: {
    id: string
    name: string | null
    avatar: string | null
  } | null
}

interface CommentsSectionProps {
  articleSlug: string
}

export function CommentsSection({ articleSlug }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()

  const fetchComments = async () => {
    try {
      const response = await fetch(`/api/articles/by-slug/${articleSlug}/comments`)
      if (response.ok) {
        const data = await response.json()
        setComments(data.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchComments()
  }, [articleSlug])

  return (
    <div id="comments-section" className="mt-12 pt-8 border-t border-[var(--wsj-border-light)]">
      <h2 className="font-serif font-bold text-[var(--wsj-font-size-2xl)] mb-6 text-[var(--wsj-text-black)]">
        Comments ({comments.length})
      </h2>

      {/* Comment Form */}
      {session ? (
        <div className="mb-8">
          <CommentForm articleSlug={articleSlug} onCommentAdded={fetchComments} />
        </div>
      ) : (
        <div className="mb-8 p-4 bg-[var(--wsj-bg-light-gray)] rounded border border-[var(--wsj-border-light)]">
          <p className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans mb-2">
            Please sign in to leave a comment.
          </p>
          <a
            href="/api/auth/signin"
            className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-blue-primary)] hover:underline font-sans"
          >
            Sign in with Google →
          </a>
        </div>
      )}

      {/* Comments List */}
      {loading ? (
        <div className="text-[var(--wsj-text-medium-gray)] font-sans">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="text-[var(--wsj-text-medium-gray)] font-sans">
          No comments yet. Be the first to comment!
        </div>
      ) : (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div
              key={comment.id}
              className="pb-6 border-b border-[var(--wsj-border-light)] last:border-b-0"
            >
              <div className="flex gap-4">
                {comment.author?.avatar ? (
                  <div className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={comment.author.avatar}
                      alt={comment.author.name || 'User'}
                      fill
                      className="object-cover"
                      sizes="40px"
                    />
                  </div>
                ) : (
                  <div className="w-10 h-10 rounded-full bg-[var(--wsj-bg-light-gray)] flex items-center justify-center flex-shrink-0">
                    <span className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
                      {comment.author?.name?.[0]?.toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-sans font-medium text-[var(--wsj-font-size-base)] text-[var(--wsj-text-black)]">
                      {comment.author?.name || 'Anonymous'}
                    </span>
                    <span className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] font-sans">
                      {format(new Date(comment.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                  <p className="text-[var(--wsj-font-size-base)] text-[var(--wsj-text-dark-gray)] font-sans leading-[var(--wsj-line-height-loose)] whitespace-pre-wrap">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}


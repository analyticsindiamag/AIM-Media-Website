'use client'

import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Comment {
  id: string
  content: string
  createdAt: string
  approved: boolean
  author: {
    id: string
    name: string | null
    email: string | null
    avatar: string | null
  } | null
  article: {
    id: string
    title: string
    slug: string
  }
}

export default function CommentsPage() {
  const [pendingComments, setPendingComments] = useState<Comment[]>([])
  const [approvedComments, setApprovedComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchComments()
  }, [])

  const fetchComments = async () => {
    try {
      // Fetch pending comments
      const pendingResponse = await fetch('/api/admin/comments?status=pending')
      if (pendingResponse.ok) {
        const pendingData = await pendingResponse.json()
        setPendingComments(pendingData.comments || [])
      }

      // Fetch approved comments
      const approvedResponse = await fetch('/api/admin/comments?status=approved')
      if (approvedResponse.ok) {
        const approvedData = await approvedResponse.json()
        setApprovedComments(approvedData.comments || [])
      }
    } catch (error) {
      console.error('Error fetching comments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleApprove = async (commentId: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ approved: true }),
      })

      if (response.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('Error approving comment:', error)
    }
  }

  const handleReject = async (commentId: string) => {
    try {
      const response = await fetch(`/api/admin/comments/${commentId}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchComments()
      }
    } catch (error) {
      console.error('Error rejecting comment:', error)
    }
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Comments Moderation</h1>
        <p className="text-gray-600">
          Review and approve comments from users
        </p>
      </div>

      {/* Pending Comments */}
      <div className="mb-8">
        <h2 className="text-xl font-semibold mb-4">
          Pending Approval ({pendingComments.length})
        </h2>
        {pendingComments.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">
            No pending comments
          </div>
        ) : (
          <div className="space-y-4">
            {pendingComments.map((comment) => (
              <div
                key={comment.id}
                className="border border-gray-200 rounded-lg p-4 bg-white"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-medium">
                        {comment.author?.name || 'Anonymous'}
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <div className="text-sm text-gray-500">
                      On:{' '}
                      <Link
                        href={`/article/${comment.article.slug}`}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                      >
                        {comment.article.title}
                      </Link>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(comment.id)}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleReject(comment.id)}
                      variant="destructive"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recently Approved Comments */}
      <div>
        <h2 className="text-xl font-semibold mb-4">
          Recently Approved ({approvedComments.length})
        </h2>
        {approvedComments.length === 0 ? (
          <div className="text-gray-500 py-8 text-center">
            No approved comments yet
          </div>
        ) : (
          <div className="space-y-4">
            {approvedComments.map((comment) => (
              <div
                key={comment.id}
                className="border border-gray-200 rounded-lg p-4 bg-gray-50"
              >
                <div className="flex items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="font-medium">
                        {comment.author?.name || 'Anonymous'}
                      </div>
                      <span className="text-sm text-gray-500">
                        {format(new Date(comment.createdAt), 'MMM d, yyyy h:mm a')}
                      </span>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                        Approved
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3 whitespace-pre-wrap">
                      {comment.content}
                    </p>
                    <div className="text-sm text-gray-500">
                      On:{' '}
                      <Link
                        href={`/article/${comment.article.slug}`}
                        className="text-blue-600 hover:underline"
                        target="_blank"
                      >
                        {comment.article.title}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

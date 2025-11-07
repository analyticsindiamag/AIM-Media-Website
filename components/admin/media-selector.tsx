'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, X, Check } from 'lucide-react'
import Image from 'next/image'

interface MediaItem {
  id: string
  filename: string
  mimeType: string
  size: number
  altText: string | null
  title: string | null
  caption: string | null
  createdAt: string
}

interface MediaSelectorProps {
  onSelect: (mediaId: string) => void
  onClose: () => void
  currentMediaId?: string | null
}

export function MediaSelector({ onSelect, onClose, currentMediaId }: MediaSelectorProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    fetchMedia()
  }, [page, search])

  const fetchMedia = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '24',
      })
      if (search) {
        params.append('search', search)
      }

      const response = await fetch(`/api/media?${params}`)
      if (response.ok) {
        const data = await response.json()
        if (page === 1) {
          setMedia(data.media)
        } else {
          setMedia((prev) => [...prev, ...data.media])
        }
        setHasMore(data.pagination.page < data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch media:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSelect = (mediaId: string) => {
    onSelect(mediaId)
    onClose()
  }

  const getImageUrl = (mediaId: string) => {
    return `/api/media/${mediaId}`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-bold">Select Image from Gallery</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              type="text"
              placeholder="Search images..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
        </div>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto p-4">
          {loading && page === 1 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">Loading images...</p>
            </div>
          ) : media.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">
                {search ? 'No images found' : 'No images available'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {media.map((item) => {
                const isSelected = item.id === currentMediaId
                return (
                  <div
                    key={item.id}
                    className={`group relative aspect-square rounded-lg overflow-hidden border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-blue-500 ring-2 ring-blue-200'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                    onClick={() => handleSelect(item.id)}
                  >
                    <Image
                      src={getImageUrl(item.id)}
                      alt={item.altText || item.filename}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-blue-500 text-white rounded-full p-2">
                          <Check className="w-6 h-6" />
                        </div>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-60 text-white p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-xs truncate">{item.filename}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Load More */}
          {hasMore && !loading && (
            <div className="text-center mt-4">
              <Button
                variant="outline"
                onClick={() => setPage((p) => p + 1)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </div>
    </div>
  )
}

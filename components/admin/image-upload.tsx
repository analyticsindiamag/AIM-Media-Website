'use client'

import { useState } from 'react'
import { Upload, X, Image as ImageIcon } from 'lucide-react'
import Image from 'next/image'
import { MediaSelector } from './media-selector'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface ImageUploadProps {
  value?: string // URL value
  mediaId?: string | null // Media ID from database
  onChange: (url: string, mediaId?: string | null) => void
  label: string
}

type ImageSource = 'url' | 'gallery'

export function ImageUpload({ value, mediaId, onChange, label }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string>('')
  const [source, setSource] = useState<ImageSource>(mediaId ? 'gallery' : (value ? 'url' : 'url'))
  const [showGallery, setShowGallery] = useState(false)

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file')
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size must be less than 10MB')
      return
    }

    setUploading(true)
    setError('')

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/media', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.error || `Upload failed: ${response.status} ${response.statusText}`
        throw new Error(errorMessage)
      }

      const { media } = await response.json()
      onChange('', media.id) // Pass empty URL and media ID
      setSource('gallery')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to upload image'
      setError(errorMessage)
      console.error('Upload error:', err)
    } finally {
      setUploading(false)
    }
  }

  const handleUrlChange = (url: string) => {
    onChange(url, null)
    setSource('url')
  }

  const handleMediaSelect = (selectedMediaId: string) => {
    onChange('', selectedMediaId)
    setSource('gallery')
    setShowGallery(false)
  }

  const handleRemove = () => {
    onChange('', null)
    setSource('url')
  }

  const getImageUrl = () => {
    if (mediaId) {
      return `/api/media/${mediaId}`
    }
    return value || ''
  }

  const imageUrl = getImageUrl()

  return (
    <div>
      <label className="block text-sm font-medium mb-2">{label}</label>

      {/* Source Selection */}
      <div className="flex gap-2 mb-4">
        <Button
          type="button"
          variant={source === 'url' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSource('url')
            if (mediaId) {
              onChange('', null)
            }
          }}
        >
          URL Link
        </Button>
        <Button
          type="button"
          variant={source === 'gallery' ? 'default' : 'outline'}
          size="sm"
          onClick={() => {
            setSource('gallery')
            if (value) {
              onChange('', null)
            }
            setShowGallery(true)
          }}
        >
          <ImageIcon className="w-4 h-4 mr-2" />
          Media Gallery
        </Button>
      </div>

      {/* URL Input */}
      {source === 'url' && (
        <div className="space-y-2">
          <Input
            type="url"
            placeholder="Enter image URL"
            value={value || ''}
            onChange={(e) => handleUrlChange(e.target.value)}
          />
          {imageUrl && (
            <div className="relative group">
              <div className="relative w-full h-64 rounded-lg overflow-hidden">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={handleRemove}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Gallery Selector */}
      {source === 'gallery' && (
        <div className="space-y-2">
          {showGallery ? (
            <MediaSelector
              onSelect={handleMediaSelect}
              currentMediaId={mediaId}
              onClose={() => setShowGallery(false)}
            />
          ) : (
            <>
              {imageUrl ? (
                <div className="relative group">
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <Image
                      src={imageUrl}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRemove}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowGallery(true)}
                  className="w-full h-64"
                >
                  <ImageIcon className="w-8 h-8 mr-2" />
                  Select from Gallery
                </Button>
              )}
            </>
          )}
        </div>
      )}

      {/* Upload Option (always available) */}
      {source === 'gallery' && !showGallery && (
        <div className="mt-2">
          <label className="block w-full border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors cursor-pointer">
            <div className="flex flex-col items-center justify-center py-4">
              <Upload className="w-8 h-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-600">
                {uploading ? 'Uploading...' : 'Or upload new image'}
              </p>
              <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>
        </div>
      )}

      {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
    </div>
  )
}


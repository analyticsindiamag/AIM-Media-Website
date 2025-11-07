"use client"

import { Type, MessageCircle, MoreVertical } from 'lucide-react'
import { ShareButtons } from './share-buttons'
import { LikeButton } from './like-button'
import { useEffect, useRef, useState } from 'react'

interface ArticleInteractiveBarProps {
  url: string
  title: string
  articleSlug: string
  variant?: 'default' | 'light'
  readTime?: number
  initialLikesCount?: number
  initialIsLiked?: boolean
}

export function ArticleInteractiveBar({ 
  url, 
  title, 
  articleSlug,
  variant = 'default', 
  readTime,
  initialLikesCount = 0,
  initialIsLiked = false,
}: ArticleInteractiveBarProps) {
  const [fontSize, setFontSize] = useState(16)
  const menuRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [showMenu, setShowMenu] = useState(false)
  const [commentCount, setCommentCount] = useState(0)

  useEffect(() => {
    // Get initial font size from document
    const initialSize = parseInt(getComputedStyle(document.documentElement).fontSize)
    setFontSize(initialSize)

    // Handle click outside menu
    const handleClickOutside = (event: MouseEvent) => {
      if (
        menuRef.current &&
        buttonRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false)
      }
    }

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showMenu])

  // Fetch comment count
  useEffect(() => {
    const fetchCommentCount = async () => {
      try {
        const response = await fetch(`/api/articles/by-slug/${articleSlug}/comments`)
        if (response.ok) {
          const data = await response.json()
          setCommentCount(data.comments?.length || 0)
        }
      } catch (error) {
        console.error('Error fetching comment count:', error)
      }
    }
    fetchCommentCount()
  }, [articleSlug])

  const handleResize = () => {
    const html = document.documentElement
    const currentSize = parseInt(getComputedStyle(html).fontSize)
    let newSize: number
    
    if (currentSize >= 20) {
      newSize = 16 // Reset to default
    } else {
      newSize = currentSize + 2 // Increase by 2px
    }
    
    html.style.fontSize = `${newSize}px`
    setFontSize(newSize)
  }

  const handleComments = () => {
    const commentsSection = document.getElementById('comments-section')
    if (commentsSection) {
      commentsSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
    } else {
      // Scroll to bottom of article if no comments section
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' })
    }
  }

  const handlePrint = () => {
    window.print()
    setShowMenu(false)
  }

  const handleEmail = () => {
    const subject = encodeURIComponent(title)
    const body = encodeURIComponent(url)
    window.open(`mailto:?subject=${subject}&body=${body}`)
    setShowMenu(false)
  }

  const textColorClass = variant === 'light'
    ? 'text-white hover:text-white/80'
    : 'text-[var(--wsj-text-black)] hover:text-[var(--wsj-text-medium-gray)]'
  
  const separatorClass = variant === 'light'
    ? 'border-white/30'
    : 'border-[var(--wsj-border-light)]'

  return (
    <div className={`flex items-center gap-4 text-[var(--wsj-font-size-sm)] font-sans flex-wrap ${variant === 'light' ? 'text-white' : ''}`}>
      <ShareButtons 
        url={url}
        title={title}
        compact={true}
        variant={variant}
      />
      <button 
        className={`flex items-center gap-1 ${textColorClass} transition-colors`}
        onClick={handleResize}
        aria-label="Resize text"
        title="Increase text size"
      >
        <Type className="w-4 h-4" />
        <span>{variant === 'light' ? 'Resize' : 'AA Resize'}</span>
      </button>
      <LikeButton
        articleSlug={articleSlug}
        initialLikesCount={initialLikesCount}
        initialIsLiked={initialIsLiked}
        variant={variant}
        compact={false}
      />
      <button 
        className={`flex items-center gap-1 ${textColorClass} transition-colors`}
        onClick={handleComments}
        aria-label="View comments"
      >
        <MessageCircle className="w-4 h-4" />
        <span>{commentCount}</span>
      </button>
      {variant === 'light' && <div className={`border-l ${separatorClass} h-4 mx-2`} />}
      <div className="relative">
        <button 
          ref={buttonRef}
          className={`${textColorClass} transition-colors`}
          onClick={() => setShowMenu(!showMenu)}
          aria-label="More options"
          aria-expanded={showMenu}
        >
          <MoreVertical className="w-4 h-4" />
        </button>
        {showMenu && (
          <div 
            ref={menuRef}
            className="absolute bg-white shadow-lg rounded border p-2 mt-2 z-50 right-0 top-full min-w-[120px]"
          >
            <button 
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-[var(--wsj-text-black)] transition-colors"
              onClick={handlePrint}
            >
              Print
            </button>
            <button 
              className="block w-full text-left px-4 py-2 hover:bg-gray-100 text-sm text-[var(--wsj-text-black)] transition-colors"
              onClick={handleEmail}
            >
              Email
            </button>
          </div>
        )}
      </div>
    </div>
  )
}


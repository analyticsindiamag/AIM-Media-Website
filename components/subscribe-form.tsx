"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

interface SubscribeFormProps {
  className?: string
}

export function SubscribeForm({ className = '' }: SubscribeFormProps) {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const [subscribeCta, setSubscribeCta] = useState('')

  useEffect(() => {
    fetch('/api/settings')
      .then((r) => r.json())
      .then((settings) => {
        if (settings.subscribeCta) {
          setSubscribeCta(settings.subscribeCta)
        }
      })
      .catch(() => {})
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !email.includes('@')) {
      setMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Thank you for subscribing!' })
        setEmail('')
      } else {
        setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Something went wrong. Please try again.' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={className}>
      {subscribeCta && (
        <p className="text-[var(--wsj-font-size-sm)] text-[var(--wsj-text-medium-gray)] mb-3 font-sans">
          {subscribeCta}
        </p>
      )}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <Input
          type="email"
          placeholder="Enter your email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1"
          required
        />
        <Button type="submit" disabled={loading}>
          {loading ? 'Subscribing...' : 'Subscribe'}
        </Button>
      </form>
      {message && (
        <p className={`mt-2 text-sm ${
          message.type === 'success' 
            ? 'text-[var(--wsj-green-positive)]' 
            : 'text-[var(--wsj-red-negative)]'
        }`}>
          {message.text}
        </p>
      )}
    </div>
  )
}


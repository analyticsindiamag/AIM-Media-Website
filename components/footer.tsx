"use client"

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'

function SubscribeForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'ok' | 'error' | 'loading'>('idle')

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('loading')
    try {
      const res = await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (res.ok) {
        setStatus('ok')
        setEmail('')
      } else {
        setStatus('error')
      }
    } catch {
      setStatus('error')
    }
  }

  return (
    <form onSubmit={submit} className="mt-4 flex gap-2">
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="Your email"
        required
        className="w-full max-w-xs px-3 py-2 rounded bg-white text-black placeholder-gray-500"
      />
      <button type="submit" disabled={status==='loading'} className="px-4 py-2 bg-white text-black rounded hover:bg-gray-200 transition-colors">
        {status==='loading' ? 'Submitting...' : 'Subscribe'}
      </button>
      {status==='ok' && <span className="text-green-400 text-sm">Thanks for subscribing!</span>}
      {status==='error' && <span className="text-red-400 text-sm">Try again</span>}
    </form>
  )
}

export function Footer() {
  const pathname = usePathname()
  // Hide footer on admin to avoid unnecessary client widgets and hydration differences
  if (pathname?.startsWith('/admin')) return null

  const [subscribeCta, setSubscribeCta] = useState<string>('Get weekly AI insights in your inbox.')

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then((s) => {
      if (s?.subscribeCta) setSubscribeCta(s.subscribeCta)
    }).catch(() => {})
  }, [])

  return (
    <footer className="bg-black text-white mt-20">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Services */}
          <div>
            <h3 className="font-bold mb-4">Our Services</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/services/research" className="hover:text-white transition-colors">Research</Link></li>
              <li><Link href="/services/advisory" className="hover:text-white transition-colors">Advisory</Link></li>
              <li><Link href="/services/advertise" className="hover:text-white transition-colors">Advertise with us</Link></li>
            </ul>
          </div>

          {/* Data Products */}
          <div>
            <h3 className="font-bold mb-4">Data Products</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/products" className="hover:text-white transition-colors">AI Explorer</Link></li>
            </ul>
          </div>

          {/* Our Products */}
          <div>
            <h3 className="font-bold mb-4">Our Products</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/conferences" className="hover:text-white transition-colors">Conferences</Link></li>
              <li><Link href="/recognitions" className="hover:text-white transition-colors">Recognitions & Lists</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-bold mb-4">Resources</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li><Link href="/insights" className="hover:text-white transition-colors">Market Insights</Link></li>
              <li><Link href="/category/cdo-insights" className="hover:text-white transition-colors">CDO Insights Series</Link></li>
              <li><Link href="/videos" className="hover:text-white transition-colors">Videos</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
            <div className="mt-6">
              <h4 className="font-semibold">{subscribeCta}</h4>
              <SubscribeForm />
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
          <p>©2023-25 AI Tech News. All rights reserved.</p>
          <div className="mt-2 space-x-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}


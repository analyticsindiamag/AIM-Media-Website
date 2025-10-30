'use client'

import { useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'

export default function SettingsPage() {
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    siteName: '',
    logoUrl: '',
    navLinksJson: '',
    footerLinksJson: '',
    subscribeCta: '',
  })

  useEffect(() => {
    fetch('/api/settings').then(r => r.json()).then((s) => {
      setForm({
        siteName: s.siteName || '',
        logoUrl: s.logoUrl || '',
        navLinksJson: s.navLinksJson || '',
        footerLinksJson: s.footerLinksJson || '',
        subscribeCta: s.subscribeCta || '',
      })
    })
  }, [])

  const save = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      if (!res.ok) alert('Failed to save settings')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Site Settings</h1>

      <div className="space-y-6">
        <div>
          <Label htmlFor="siteName">Site Name</Label>
          <Input id="siteName" value={form.siteName} onChange={(e) => setForm({ ...form, siteName: e.target.value })} />
        </div>
        <div>
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input id="logoUrl" value={form.logoUrl} onChange={(e) => setForm({ ...form, logoUrl: e.target.value })} placeholder="https://..." />
        </div>
        <div>
          <Label htmlFor="subscribeCta">Subscribe CTA Text</Label>
          <Input id="subscribeCta" value={form.subscribeCta} onChange={(e) => setForm({ ...form, subscribeCta: e.target.value })} placeholder="Get weekly AI insights..." />
        </div>
        <div>
          <Label htmlFor="navLinksJson">Nav Links JSON</Label>
          <Textarea id="navLinksJson" rows={4} value={form.navLinksJson} onChange={(e) => setForm({ ...form, navLinksJson: e.target.value })} placeholder='[{"label":"ENTERPRISE AI","href":"/category/enterprise-ai"}]' />
        </div>
        <div>
          <Label htmlFor="footerLinksJson">Footer Links JSON</Label>
          <Textarea id="footerLinksJson" rows={4} value={form.footerLinksJson} onChange={(e) => setForm({ ...form, footerLinksJson: e.target.value })} placeholder='[{"label":"Privacy","href":"/privacy"}]' />
        </div>
        <div className="pt-4">
          <Button onClick={save} disabled={loading}>{loading ? 'Saving...' : 'Save Settings'}</Button>
        </div>
      </div>
    </div>
  )
}

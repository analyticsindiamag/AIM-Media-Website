'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, Loader2, Globe, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface ImportResult {
  success: boolean
  summary: {
    users: {
      total: number
      successful: number
      failed: number
      created: number
      updated: number
    }
    categories: {
      total: number
      successful: number
      failed: number
      created: number
      updated: number
    }
    articles: {
      total: number
      successful: number
      failed: number
      created: number
      updated: number
    }
  }
  results: {
    users: Array<{
      type: 'user'
      wpId: number
      title: string
      success: boolean
      action: 'created' | 'updated' | 'skipped'
      slug?: string
      errors?: string[]
    }>
    categories: Array<{
      type: 'category'
      wpId: number
      title: string
      success: boolean
      action: 'created' | 'updated' | 'skipped'
      slug?: string
      errors?: string[]
    }>
    articles: Array<{
      type: 'article'
      wpId: number
      title: string
      success: boolean
      action: 'created' | 'updated' | 'skipped'
      slug?: string
      errors?: string[]
    }>
  }
}

export default function WordPressRestImportPage() {
  const [wordpressUrl, setWordpressUrl] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [skipExisting, setSkipExisting] = useState(false)
  const [testingConnection, setTestingConnection] = useState(false)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [showUsers, setShowUsers] = useState(true)
  const [showCategories, setShowCategories] = useState(true)
  const [showArticles, setShowArticles] = useState(true)

  const testConnection = async () => {
    if (!wordpressUrl.trim()) {
      setError('WordPress URL is required')
      return
    }

    setTestingConnection(true)
    setError(null)

    try {
      const response = await fetch('/api/import/wordpress-rest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordpressUrl: wordpressUrl.trim(),
          username: username || undefined,
          password: password || undefined,
          testOnly: true,
        }),
      })

      const data = await response.json()

      if (response.ok && data.success) {
        alert('Connection successful! You can proceed with the import.')
      } else {
        setError(data.error || data.message || 'Connection failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to test connection')
    } finally {
      setTestingConnection(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!wordpressUrl.trim()) {
      setError('WordPress URL is required')
      return
    }

    setLoading(true)
    setResult(null)
    setError(null)

    try {
      const response = await fetch('/api/import/wordpress-rest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          wordpressUrl: wordpressUrl.trim(),
          username: username || undefined,
          password: password || undefined,
          skipExisting,
          importStatus: ['publish', 'future'],
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
      } else {
        const errorData = await response.json()
        setError(errorData.error || errorData.message || 'Import failed')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred during import')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl">
      <h1 className="text-3xl font-bold mb-4">Import from WordPress REST API</h1>
      <p className="text-muted-foreground mb-8">
        Import posts, categories, and authors directly from your WordPress site using the REST API. 
        This method is ideal for migrating large amounts of content without manual CSV exports.
      </p>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">Configuration</h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="wordpressUrl">WordPress Site URL</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="wordpressUrl"
                type="text"
                placeholder="https://example.com or example.com"
                value={wordpressUrl}
                onChange={(e) => setWordpressUrl(e.target.value)}
                disabled={loading || testingConnection}
                className="flex-1"
              />
              <Button
                type="button"
                onClick={testConnection}
                disabled={!wordpressUrl.trim() || loading || testingConnection}
                variant="outline"
              >
                {testingConnection ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <Globe className="w-4 h-4 mr-2" />
                    Test Connection
                  </>
                )}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Enter your WordPress site URL (e.g., <code className="bg-gray-100 px-1 rounded">aimmediahouse.com</code> or <code className="bg-gray-100 px-1 rounded">https://aimmediahouse.com</code>). 
              The importer automatically fetches users, categories, and posts - you only need ONE URL!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="username">Username (Optional)</Label>
              <Input
                id="username"
                type="text"
                placeholder="WordPress username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading || testingConnection}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Required if your WordPress REST API requires authentication
              </p>
            </div>

            <div>
              <Label htmlFor="password">Application Password (Optional)</Label>
              <Input
                id="password"
                type="password"
                placeholder="Application password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading || testingConnection}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Generate an Application Password in WordPress user settings
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="skipExisting"
              checked={skipExisting}
              onChange={(e) => setSkipExisting(e.target.checked)}
              disabled={loading || testingConnection}
              className="rounded"
            />
            <Label htmlFor="skipExisting" className="cursor-pointer">
              Skip existing items (don't update)
            </Label>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-red-800">Error</div>
                  <div className="text-sm text-red-700 mt-1">{error}</div>
                </div>
              </div>
            </div>
          )}

          <Button type="submit" disabled={!wordpressUrl.trim() || loading || testingConnection} className="w-full">
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Importing...
              </>
            ) : (
              <>
                <Key className="w-4 h-4 mr-2" />
                Start Import
              </>
            )}
          </Button>
        </form>

        {/* Results */}
        {result && (
          <div className="mt-8 space-y-6">
            {/* Summary */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Import Complete!
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Users Summary */}
                <div className="bg-white p-4 rounded border">
                  <div className="text-sm font-semibold mb-2">Users/Editors</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-bold text-lg">{result.summary.users.total}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Success</div>
                      <div className="font-bold text-lg text-green-700">{result.summary.users.successful}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Created</div>
                      <div className="font-bold text-blue-700">{result.summary.users.created}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Updated</div>
                      <div className="font-bold text-purple-700">{result.summary.users.updated}</div>
                    </div>
                  </div>
                </div>

                {/* Categories Summary */}
                <div className="bg-white p-4 rounded border">
                  <div className="text-sm font-semibold mb-2">Categories</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-bold text-lg">{result.summary.categories.total}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Success</div>
                      <div className="font-bold text-lg text-green-700">{result.summary.categories.successful}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Created</div>
                      <div className="font-bold text-blue-700">{result.summary.categories.created}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Updated</div>
                      <div className="font-bold text-purple-700">{result.summary.categories.updated}</div>
                    </div>
                  </div>
                </div>

                {/* Articles Summary */}
                <div className="bg-white p-4 rounded border">
                  <div className="text-sm font-semibold mb-2">Articles</div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-muted-foreground">Total</div>
                      <div className="font-bold text-lg">{result.summary.articles.total}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Success</div>
                      <div className="font-bold text-lg text-green-700">{result.summary.articles.successful}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Created</div>
                      <div className="font-bold text-blue-700">{result.summary.articles.created}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Updated</div>
                      <div className="font-bold text-purple-700">{result.summary.articles.updated}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Users Results */}
            {result.results.users.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowUsers(!showUsers)}
                  className="w-full p-4 bg-green-50 hover:bg-green-100 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">
                      Users/Editors ({result.results.users.length})
                    </span>
                  </div>
                  {showUsers ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {showUsers && (
                  <div className="p-4 bg-white max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {result.results.users.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded border ${
                            item.success ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-muted-foreground">
                                  WP ID: {item.wpId}
                                </span>
                                {item.success && (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded ${
                                      item.action === 'created'
                                        ? 'bg-blue-100 text-blue-700'
                                        : item.action === 'updated'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {item.action}
                                  </span>
                                )}
                              </div>
                              <div className="font-medium text-sm">{item.title}</div>
                              {item.success && item.slug && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Slug: <code className="bg-gray-200 px-1 rounded">{item.slug}</code>
                                </div>
                              )}
                              {item.errors && item.errors.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {item.errors.map((error, errorIdx) => (
                                    <div key={errorIdx} className="text-xs text-red-600">
                                      • {error}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Categories Results */}
            {result.results.categories.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowCategories(!showCategories)}
                  className="w-full p-4 bg-green-50 hover:bg-green-100 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">
                      Categories ({result.results.categories.length})
                    </span>
                  </div>
                  {showCategories ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {showCategories && (
                  <div className="p-4 bg-white max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {result.results.categories.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded border ${
                            item.success ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-muted-foreground">
                                  WP ID: {item.wpId}
                                </span>
                                {item.success && (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded ${
                                      item.action === 'created'
                                        ? 'bg-blue-100 text-blue-700'
                                        : item.action === 'updated'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {item.action}
                                  </span>
                                )}
                              </div>
                              <div className="font-medium text-sm">{item.title}</div>
                              {item.success && item.slug && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Slug: <code className="bg-gray-200 px-1 rounded">{item.slug}</code>
                                </div>
                              )}
                              {item.errors && item.errors.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {item.errors.map((error, errorIdx) => (
                                    <div key={errorIdx} className="text-xs text-red-600">
                                      • {error}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Articles Results */}
            {result.results.articles.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowArticles(!showArticles)}
                  className="w-full p-4 bg-green-50 hover:bg-green-100 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">
                      Articles ({result.results.articles.length})
                    </span>
                  </div>
                  {showArticles ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </button>
                
                {showArticles && (
                  <div className="p-4 bg-white max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {result.results.articles.map((item, idx) => (
                        <div
                          key={idx}
                          className={`p-3 rounded border ${
                            item.success ? 'bg-gray-50 border-gray-200' : 'bg-red-50 border-red-200'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-muted-foreground">
                                  WP ID: {item.wpId}
                                </span>
                                {item.success && (
                                  <span
                                    className={`text-xs px-2 py-0.5 rounded ${
                                      item.action === 'created'
                                        ? 'bg-blue-100 text-blue-700'
                                        : item.action === 'updated'
                                        ? 'bg-purple-100 text-purple-700'
                                        : 'bg-gray-100 text-gray-700'
                                    }`}
                                  >
                                    {item.action}
                                  </span>
                                )}
                              </div>
                              <div className="font-medium text-sm">{item.title}</div>
                              {item.success && item.slug && (
                                <div className="text-xs text-muted-foreground mt-1">
                                  Slug: <code className="bg-gray-200 px-1 rounded">{item.slug}</code>
                                </div>
                              )}
                              {item.errors && item.errors.length > 0 && (
                                <div className="mt-2 space-y-1">
                                  {item.errors.map((error, errorIdx) => (
                                    <div key={errorIdx} className="text-xs text-red-600">
                                      • {error}
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


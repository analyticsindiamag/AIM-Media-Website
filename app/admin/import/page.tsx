'use client'

import { useState } from 'react'
import { Upload, CheckCircle2, XCircle, AlertCircle, ChevronDown, ChevronUp, Globe, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface ImportResult {
  summary: {
    total: number
    successful: number
    failed: number
    created: number
    updated: number
  }
  successful: Array<{
    rowNumber: number
    title: string
    action: 'created' | 'updated'
    slug: string
  }>
  failed: Array<{
    rowNumber: number
    title: string
    errors: string[]
  }>
}

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [showSuccessful, setShowSuccessful] = useState(true)
  const [showFailed, setShowFailed] = useState(true)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) return

    setLoading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import/wordpress', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        setResult(data)
        setFile(null)
      } else {
        const errorData = await response.json()
        alert(`Import failed: ${errorData.error}`)
      }
    } catch (_error) {
      alert('An error occurred during import')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold mb-4">Import from WordPress</h1>
      
      {/* REST API Import Option */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Globe className="w-5 h-5 text-blue-600" />
              <h3 className="font-semibold text-blue-900">Import via REST API</h3>
            </div>
            <p className="text-sm text-blue-800 mb-3">
              Import directly from your WordPress site using the REST API. Ideal for large migrations without manual CSV exports.
            </p>
            <Link href="/admin/import/rest">
              <Button variant="outline" className="bg-white hover:bg-blue-100">
                Use REST API Import
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">CSV Import</h2>
        <p className="text-sm text-muted-foreground">
          Upload a WordPress export CSV file to import your articles. The importer automatically recognizes WordPress CSV column names (Title, Content, Categories, Image URL, Author Email, etc.) and maps them to our database schema.
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">CSV Format</h2>
        <div className="bg-gray-50 p-4 rounded mb-6">
          <p className="text-sm mb-3">
            <strong>Required columns:</strong> <code className="bg-gray-200 px-1 rounded">Title</code>, <code className="bg-gray-200 px-1 rounded">Content</code>
          </p>
          <p className="text-sm font-mono mb-2">Supported WordPress CSV columns:</p>
          <ul className="text-sm font-mono space-y-1 text-muted-foreground">
            <li>• Title, Content (required)</li>
            <li>• Excerpt, Slug, Date, Status</li>
            <li>• Categories (creates category if needed)</li>
            <li>• Image URL (featured image)</li>
            <li>• Author First Name, Author Last Name</li>
            <li>• Author Email, Author Username</li>
            <li>• Meta Title, Meta Description</li>
          </ul>
          <p className="text-xs text-muted-foreground mt-3">
            <strong>Note:</strong> Tags, Post Type, Permalink, and other WordPress-specific fields are not imported. See <a href="/WORDPRESS_CSV_MAPPING.md" target="_blank" className="text-blue-600 hover:underline">WORDPRESS_CSV_MAPPING.md</a> for complete field mapping.
          </p>
          <div className="mt-4 pt-4 border-t border-gray-300">
            <p className="text-sm mb-2"><strong>Important:</strong></p>
            <ul className="text-xs space-y-1 text-muted-foreground">
              <li>• Categories and editors are automatically created if they don't exist</li>
              <li>• If an article with the same slug exists, it will be updated (not duplicated)</li>
              <li>• Editor matching prioritizes email, then name</li>
              <li>• Download the CSV template: <a href="/import-template.csv" download className="text-blue-600 hover:underline">import-template.csv</a></li>
            </ul>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select CSV File
            </label>
            <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-gray-400 transition-colors">
              {file ? (
                <div className="text-center">
                  <p className="text-sm font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <Upload className="w-10 h-10 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">
                    Click to upload CSV file
                  </p>
                </div>
              )}
              <input
                type="file"
                accept=".csv"
                onChange={(e) => setFile(e.target.files?.[0] || null)}
                className="hidden"
              />
            </label>
          </div>

          <Button type="submit" disabled={!file || loading} className="w-full">
            {loading ? 'Importing...' : 'Import Articles'}
          </Button>
        </form>

        {/* Results */}
        {result && (
          <div className="mt-6 space-y-4">
            {/* Summary */}
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-blue-600" />
                Import Complete!
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
                <div className="bg-white p-3 rounded border">
                  <div className="text-xs text-muted-foreground">Total Rows</div>
                  <div className="text-2xl font-bold">{result.summary.total}</div>
                </div>
                <div className="bg-green-50 p-3 rounded border border-green-200">
                  <div className="text-xs text-muted-foreground">Successful</div>
                  <div className="text-2xl font-bold text-green-700">{result.summary.successful}</div>
                </div>
                <div className="bg-red-50 p-3 rounded border border-red-200">
                  <div className="text-xs text-muted-foreground">Failed</div>
                  <div className="text-2xl font-bold text-red-700">{result.summary.failed}</div>
                </div>
                <div className="bg-blue-50 p-3 rounded border border-blue-200">
                  <div className="text-xs text-muted-foreground">Created</div>
                  <div className="text-2xl font-bold text-blue-700">{result.summary.created}</div>
                </div>
                <div className="bg-purple-50 p-3 rounded border border-purple-200">
                  <div className="text-xs text-muted-foreground">Updated</div>
                  <div className="text-2xl font-bold text-purple-700">{result.summary.updated}</div>
                </div>
              </div>
            </div>

            {/* Successful Imports */}
            {result.successful.length > 0 && (
              <div className="border rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowSuccessful(!showSuccessful)}
                  className="w-full p-4 bg-green-50 hover:bg-green-100 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-green-600" />
                    <span className="font-semibold">
                      Successfully Imported ({result.successful.length})
                    </span>
                  </div>
                  {showSuccessful ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                
                {showSuccessful && (
                  <div className="p-4 bg-white max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {result.successful.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-gray-50 rounded border border-gray-200"
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-muted-foreground">
                                  Row {item.rowNumber}
                                </span>
                                <span
                                  className={`text-xs px-2 py-0.5 rounded ${
                                    item.action === 'created'
                                      ? 'bg-blue-100 text-blue-700'
                                      : 'bg-purple-100 text-purple-700'
                                  }`}
                                >
                                  {item.action === 'created' ? 'Created' : 'Updated'}
                                </span>
                              </div>
                              <div className="font-medium text-sm">{item.title}</div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Slug: <code className="bg-gray-200 px-1 rounded">{item.slug}</code>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Failed Imports */}
            {result.failed.length > 0 && (
              <div className="border rounded-lg overflow-hidden border-red-200">
                <button
                  onClick={() => setShowFailed(!showFailed)}
                  className="w-full p-4 bg-red-50 hover:bg-red-100 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-600" />
                    <span className="font-semibold">
                      Failed to Import ({result.failed.length})
                    </span>
                  </div>
                  {showFailed ? (
                    <ChevronUp className="w-5 h-5" />
                  ) : (
                    <ChevronDown className="w-5 h-5" />
                  )}
                </button>
                
                {showFailed && (
                  <div className="p-4 bg-white max-h-96 overflow-y-auto">
                    <div className="space-y-3">
                      {result.failed.map((item, idx) => (
                        <div
                          key={idx}
                          className="p-3 bg-red-50 rounded border border-red-200"
                        >
                          <div className="flex items-start gap-2 mb-2">
                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs font-mono text-muted-foreground">
                                  Row {item.rowNumber}
                                </span>
                              </div>
                              <div className="font-medium text-sm mb-2">
                                {item.title || `Row ${item.rowNumber}`}
                              </div>
                              <div className="space-y-1">
                                <div className="text-xs font-semibold text-red-700 mb-1">
                                  Validation Errors:
                                </div>
                                <ul className="space-y-1">
                                  {item.errors.map((error, errorIdx) => (
                                    <li
                                      key={errorIdx}
                                      className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded flex items-start gap-2"
                                    >
                                      <span className="text-red-500">•</span>
                                      <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                              </div>
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


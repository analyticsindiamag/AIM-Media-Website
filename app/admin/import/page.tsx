'use client'

import { useState } from 'react'
import { Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ImportPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    success: number
    failed: number
    errors: string[]
  } | null>(null)

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
      <p className="text-muted-foreground mb-8">
        Upload a WordPress export CSV file to import your articles. The CSV should include columns for title, content, excerpt, author, category, date, and featured image URL.
      </p>

      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-bold mb-4">CSV Format</h2>
        <div className="bg-gray-50 p-4 rounded mb-6">
          <p className="text-sm mb-3">
            <strong>Required columns:</strong> <code className="bg-gray-200 px-1 rounded">title</code> (or <code className="bg-gray-200 px-1 rounded">post_title</code>), <code className="bg-gray-200 px-1 rounded">content</code> (or <code className="bg-gray-200 px-1 rounded">post_content</code>)
          </p>
          <p className="text-sm font-mono mb-2">Optional columns:</p>
          <ul className="text-sm font-mono space-y-1 text-muted-foreground">
            <li>• excerpt / post_excerpt</li>
            <li>• slug</li>
            <li>• category / categories</li>
            <li>• author first name, author last name</li>
            <li>• author email (recommended for editor matching)</li>
            <li>• author username / post_author</li>
            <li>• status (publish/draft)</li>
            <li>• date / post_date</li>
            <li>• featured_image_url / image url</li>
            <li>• meta_title, meta_description</li>
          </ul>
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
          <div className="mt-6 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-bold mb-2">Import Complete!</h3>
            <p className="text-sm">
              Successfully imported: <strong>{result.success}</strong> articles
            </p>
            {result.failed > 0 && (
              <>
                <p className="text-sm text-destructive">
                  Failed: <strong>{result.failed}</strong> articles
                </p>
                {result.errors.length > 0 && (
                  <div className="mt-2">
                    <p className="text-sm font-medium">Errors:</p>
                    <ul className="text-xs space-y-1 mt-1">
                      {result.errors.map((error, idx) => (
                        <li key={idx} className="text-muted-foreground">
                          • {error}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}


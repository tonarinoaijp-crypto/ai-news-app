'use client'

import { useState, useEffect, useCallback } from 'react'
import { NewsArticle, Summary } from '@/lib/supabase'
import ArticleCard from '@/components/ArticleCard'
import DraftModal from '@/components/DraftModal'
import SummaryModal from '@/components/SummaryModal'

export default function Home() {
  const [articles, setArticles] = useState<NewsArticle[]>([])
  const [loading, setLoading] = useState(false)
  const [collecting, setCollecting] = useState(false)
  const [message, setMessage] = useState('')
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null)
  const [filter, setFilter] = useState<'all' | 'unposted' | 'posted'>('all')
  const [summary, setSummary] = useState<Summary | null>(null)
  const [isSummaryModalOpen, setIsSummaryModalOpen] = useState(false)
  const [isGeneratingSummary, setIsGeneratingSummary] = useState(false)

  const fetchArticles = useCallback(async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/articles')
      const data = await res.json()
      setArticles(data)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchArticles()
  }, [fetchArticles])

  const handleCollect = async (mock = false) => {
    setCollecting(true)
    setMessage('')
    try {
      const endpoint = mock ? '/api/collect-mock' : '/api/collect'
      const res = await fetch(endpoint, { method: 'POST' })
      const data = await res.json()
      setMessage(data.message || data.error)
      if (!data.error) {
        await fetchArticles()
      }
    } catch {
      setMessage('エラーが発生しました')
    } finally {
      setCollecting(false)
    }
  }

  const handleGenerateSummary = async () => {
    const unpostedIds = articles
      .filter((a) => !a.is_posted)
      .slice(0, 5)
      .map((a) => a.id)

    if (unpostedIds.length === 0) {
      setMessage('未投稿の記事がありません')
      return
    }

    setIsGeneratingSummary(true)
    setMessage('')
    try {
      const res = await fetch('/api/generate-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ article_ids: unpostedIds }),
      })
      const data = await res.json()
      if (!res.ok) {
        setMessage(data.error || 'まとめ生成に失敗しました')
        return
      }
      setSummary(data)
      setIsSummaryModalOpen(true)
    } catch {
      setMessage('エラーが発生しました')
    } finally {
      setIsGeneratingSummary(false)
    }
  }

  const handleUpdate = async (id: string, updates: Partial<NewsArticle>) => {
    await fetch(`/api/articles/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    })
    setArticles((prev) =>
      prev.map((a) => (a.id === id ? { ...a, ...updates } : a))
    )
    if (selectedArticle?.id === id) {
      setSelectedArticle((prev) => (prev ? { ...prev, ...updates } : null))
    }
  }

  const filtered = articles.filter((a) => {
    if (filter === 'unposted') return !a.is_posted
    if (filter === 'posted') return a.is_posted
    return true
  })

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-gray-900">AI News Hub</h1>
            <p className="text-xs text-gray-500">毎日のAIニュース自動収集</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleCollect(true)}
              disabled={collecting}
              className="bg-gray-200 hover:bg-gray-300 disabled:opacity-50 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium transition-colors"
              title="Anthropic APIを使わずモックデータで動作確認"
            >
              {collecting ? '...' : 'モック収集'}
            </button>
            <button
              onClick={() => handleCollect(false)}
              disabled={collecting}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              {collecting ? '収集中...' : '+ ニュース収集'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-6">
        {message && (
          <div
            className={`mb-4 px-4 py-3 rounded-lg text-sm ${
              message.includes('エラー')
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            {message}
          </div>
        )}

        {/* Filter tabs + まとめ生成ボタン */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {(['all', 'unposted', 'posted'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 border hover:bg-gray-50'
              }`}
            >
              {f === 'all'
                ? `すべて (${articles.length})`
                : f === 'unposted'
                ? `未投稿 (${articles.filter((a) => !a.is_posted).length})`
                : `投稿済 (${articles.filter((a) => a.is_posted).length})`}
            </button>
          ))}
          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            className="ml-auto px-3 py-1.5 rounded-full text-sm font-medium bg-purple-600 hover:bg-purple-700 disabled:bg-purple-300 text-white transition-colors"
          >
            {isGeneratingSummary ? '生成中...' : 'まとめ記事を生成'}
          </button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gray-400">読み込み中...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p className="text-4xl mb-3">📰</p>
            <p>記事がありません。「ニュース収集」ボタンで収集してください。</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onSelect={() => setSelectedArticle(article)}
                onTogglePosted={() =>
                  handleUpdate(article.id, { is_posted: !article.is_posted })
                }
              />
            ))}
          </div>
        )}
      </div>

      {selectedArticle && (
        <DraftModal
          article={selectedArticle}
          onClose={() => setSelectedArticle(null)}
          onSave={(updates) => handleUpdate(selectedArticle.id, updates)}
        />
      )}

      {isSummaryModalOpen && summary && (
        <SummaryModal
          summary={summary}
          onClose={() => setIsSummaryModalOpen(false)}
        />
      )}
    </main>
  )
}

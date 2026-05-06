'use client'

import { useState } from 'react'
import { NewsArticle } from '@/lib/supabase'

type Props = {
  article: NewsArticle
  onClose: () => void
  onSave: (updates: Partial<NewsArticle>) => Promise<void>
}

export default function DraftModal({ article, onClose, onSave }: Props) {
  const [draftNote, setDraftNote] = useState(article.draft_note || '')
  const [draftX, setDraftX] = useState(article.draft_x || '')
  const [saving, setSaving] = useState(false)
  const [copied, setCopied] = useState<'note' | 'x' | null>(null)

  const handleSave = async () => {
    setSaving(true)
    await onSave({ draft_note: draftNote, draft_x: draftX })
    setSaving(false)
  }

  const handleCopy = async (type: 'note' | 'x') => {
    const text = type === 'note' ? draftNote : draftX
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  const xCharCount = draftX.length

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-gray-900 text-sm leading-snug line-clamp-2">
              {article.title}
            </h2>
            {article.source && (
              <span className="text-xs text-gray-400">{article.source}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none shrink-0"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-5">
          {/* Note draft */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">note用下書き</label>
              <button
                onClick={() => handleCopy('note')}
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                  copied === 'note'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {copied === 'note' ? 'コピー済!' : 'コピー'}
              </button>
            </div>
            <textarea
              value={draftNote}
              onChange={(e) => setDraftNote(e.target.value)}
              rows={10}
              className="w-full text-sm border rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300"
              placeholder="note用の下書きがここに表示されます"
            />
          </div>

          {/* X draft */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">
                X用下書き
                <span
                  className={`ml-2 text-xs font-normal ${
                    xCharCount > 140 ? 'text-red-500' : 'text-gray-400'
                  }`}
                >
                  {xCharCount}/140文字
                </span>
              </label>
              <button
                onClick={() => handleCopy('x')}
                className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                  copied === 'x'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                }`}
              >
                {copied === 'x' ? 'コピー済!' : 'コピー'}
              </button>
            </div>
            <textarea
              value={draftX}
              onChange={(e) => setDraftX(e.target.value)}
              rows={4}
              className={`w-full text-sm border rounded-xl p-3 resize-none focus:outline-none focus:ring-2 ${
                xCharCount > 140 ? 'border-red-300 focus:ring-red-300' : 'focus:ring-blue-300'
              }`}
              placeholder="X用の下書きがここに表示されます"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t flex gap-3">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
          >
            {saving ? '保存中...' : '保存する'}
          </button>
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border hover:bg-gray-50 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

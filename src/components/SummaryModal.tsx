'use client'

import { useState } from 'react'
import { Summary } from '@/lib/supabase'

type Props = {
  summary: Summary
  onClose: () => void
}

export default function SummaryModal({ summary, onClose }: Props) {
  const [copied, setCopied] = useState<'note' | number | null>(null)

  const handleCopy = async (type: 'note' | number) => {
    const text = type === 'note' ? summary.note_draft : summary.x_posts[type]
    await navigator.clipboard.writeText(text)
    setCopied(type)
    setTimeout(() => setCopied(null), 2000)
  }

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-2xl sm:rounded-2xl rounded-t-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="px-5 py-4 border-b flex items-center justify-between">
          <h2 className="font-bold text-gray-900">まとめ記事</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-6">
          {/* note draft */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-700">note用まとめ記事</label>
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
              readOnly
              value={summary.note_draft}
              rows={14}
              className="w-full text-sm border rounded-xl p-3 resize-none focus:outline-none focus:ring-2 focus:ring-blue-300 bg-gray-50"
            />
          </div>

          {/* X posts */}
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-3">X投稿（5件）</label>
            <div className="space-y-3">
              {summary.x_posts.map((post, i) => (
                <div key={i} className="border rounded-xl p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500 font-medium">投稿 {i + 1}</span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs ${post.length > 140 ? 'text-red-500' : 'text-gray-400'}`}
                      >
                        {post.length}/140文字
                      </span>
                      <button
                        onClick={() => handleCopy(i)}
                        className={`text-xs px-3 py-1 rounded-lg transition-colors ${
                          copied === i
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                        }`}
                      >
                        {copied === i ? 'コピー済!' : 'コピー'}
                      </button>
                    </div>
                  </div>
                  <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{post}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl text-sm font-medium border hover:bg-gray-50 transition-colors"
          >
            閉じる
          </button>
        </div>
      </div>
    </div>
  )
}

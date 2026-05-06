'use client'

import { NewsArticle } from '@/lib/supabase'

type Props = {
  article: NewsArticle
  onSelect: () => void
  onTogglePosted: () => void
}

export default function ArticleCard({ article, onSelect, onTogglePosted }: Props) {
  const date = article.published_at
    ? new Date(article.published_at).toLocaleDateString('ja-JP')
    : new Date(article.collected_at).toLocaleDateString('ja-JP')

  return (
    <div
      className={`bg-white rounded-xl border p-4 transition-all ${
        article.is_posted ? 'opacity-60' : 'hover:shadow-md'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            {article.source && (
              <span className="text-xs bg-blue-50 text-blue-600 px-2 py-0.5 rounded-full font-medium">
                {article.source}
              </span>
            )}
            <span className="text-xs text-gray-400">{date}</span>
            {article.is_posted && (
              <span className="text-xs bg-green-50 text-green-600 px-2 py-0.5 rounded-full">
                投稿済
              </span>
            )}
          </div>
          <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-1.5 line-clamp-2">
            {article.title}
          </h3>
          {article.summary && (
            <p className="text-xs text-gray-500 line-clamp-2">{article.summary}</p>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 mt-3 pt-3 border-t">
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-blue-500 hover:text-blue-700 truncate flex-1"
          onClick={(e) => e.stopPropagation()}
        >
          {article.url}
        </a>
        <div className="flex gap-2 shrink-0">
          <button
            onClick={onSelect}
            className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg transition-colors font-medium"
          >
            下書き確認
          </button>
          <button
            onClick={onTogglePosted}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors font-medium ${
              article.is_posted
                ? 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                : 'bg-green-50 hover:bg-green-100 text-green-700'
            }`}
          >
            {article.is_posted ? '未投稿に戻す' : '投稿済にする'}
          </button>
        </div>
      </div>
    </div>
  )
}

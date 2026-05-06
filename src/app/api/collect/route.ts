import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

// Vercel: このルートの最大実行時間を60秒に設定
export const maxDuration = 60

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

// コスト最適化設計:
//   Step1: Sonnet + web_search × 1回  → 5件収集
//   Step2: Haiku × 1回 (キャッシュ付き) → 全記事の下書きをまとめて生成
// 改善前: Sonnet × 11回 ≒ $1.28
// 改善後: Sonnet×1 + Haiku×1 ≒ $0.05〜0.10

const DRAFT_SYSTEM_PROMPT = `あなたはAI情報を発信するライターです。
複数のAIニュース記事についてnote用とX（Twitter）用の下書きを一括作成します。

【note用】400〜600文字。見出し（#）・本文・まとめを含むMarkdown形式。
【X用】140文字以内。絵文字・ハッシュタグ付き。`

type RawArticle = {
  title: string
  url: string
  summary: string
  source: string
  published_at: string
}

type DraftResult = {
  draft_note: string
  draft_x: string
}

export async function POST() {
  try {
    // Step0: 既存URLを取得（重複排除用）
    const { data: existingArticles } = await supabase
      .from('news_articles')
      .select('url')

    const existingUrls = new Set((existingArticles || []).map((a) => a.url))

    // Step1: Sonnet + web_search で5件収集（1回のみ）
    const collectResponse = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 2048,
      tools: [{ type: 'web_search_20250305', name: 'web_search' }],
      messages: [
        {
          role: 'user',
          content: `今日（${new Date().toLocaleDateString('ja-JP')}）の最新AIニュースを5件収集してください。

OpenAI・Anthropic・Google・Meta・Mistralなどの新モデル・AI規制・研究成果が対象です。

必ず以下のJSONのみ返してください（説明文不要）：
{"articles":[{"title":"","url":"","summary":"日本語200文字以内","source":"","published_at":"YYYY-MM-DD"}]}`,
        },
      ],
    })

    let articles: RawArticle[] = []
    for (const block of collectResponse.content) {
      if (block.type === 'text') {
        const match = block.text.match(/\{[\s\S]*\}/)
        if (match) {
          try {
            const parsed = JSON.parse(match[0])
            articles = parsed.articles || []
          } catch { /* continue */ }
        }
      }
    }

    const newArticles = articles.filter((a) => a.url && !existingUrls.has(a.url))

    if (newArticles.length === 0) {
      return NextResponse.json({ message: '新しい記事はありませんでした', count: 0 })
    }

    // Step2: Haiku × 1回 で全記事の下書きをまとめて生成（プロンプトキャッシュ付き）
    const articlesText = newArticles
      .map((a, i) => `[${i + 1}] タイトル:${a.title}\n要約:${a.summary}\nURL:${a.url}`)
      .join('\n\n')

    const draftResponse = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: DRAFT_SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' }, // システムプロンプトをキャッシュ
        },
      ],
      messages: [
        {
          role: 'user',
          content: `以下の${newArticles.length}件の記事すべての下書きを作成してください。

${articlesText}

必ず以下のJSON配列のみ返してください（説明文不要）：
[{"draft_note":"...","draft_x":"..."},...]`,
        },
      ],
    })

    let drafts: DraftResult[] = []
    for (const block of draftResponse.content) {
      if (block.type === 'text') {
        const match = block.text.match(/\[[\s\S]*\]/)
        if (match) {
          try {
            drafts = JSON.parse(match[0])
          } catch { /* continue */ }
        }
      }
    }

    const articlesWithDrafts = newArticles.map((article, i) => ({
      ...article,
      draft_note: drafts[i]?.draft_note || '',
      draft_x: drafts[i]?.draft_x || '',
      collected_at: new Date().toISOString(),
    }))

    // Step3: Supabaseに保存
    const { error } = await supabase.from('news_articles').insert(articlesWithDrafts)
    if (error) throw error

    return NextResponse.json({
      message: `${articlesWithDrafts.length}件の新しい記事を収集しました`,
      count: articlesWithDrafts.length,
    })
  } catch (error) {
    console.error('Collect error:', error)
    return NextResponse.json(
      { error: '収集中にエラーが発生しました', detail: String(error) },
      { status: 500 }
    )
  }
}

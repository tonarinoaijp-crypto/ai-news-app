import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { createClient } from '@supabase/supabase-js'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY!,
})

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const systemPrompt = `あなたはAI初心者向けのニュースライターです。
ニュース5件をもとに以下を生成してください。

【note記事の要件】
- 文字数：1200〜1500字
- 構成：導入（2〜3行）→ 各ニュース解説（見出し+3〜4文）→ まとめ
- トーン：専門用語を避けた平易な言葉、「なぜ重要か」を必ず添える
- 末尾に「#AI #AIニュース #隣のAI」を付ける

【X投稿の要件】
- 5件それぞれに1投稿、合計5件
- 各140字以内、冒頭に絵文字、末尾に #AI と関連ハッシュタグ

【出力形式】
JSONのみ返すこと（コードブロック不要）：
{
  "note_draft": "Markdown形式のnote記事全文",
  "x_posts": ["投稿1", "投稿2", "投稿3", "投稿4", "投稿5"]
}`

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { article_ids }: { article_ids: string[] } = body

    if (!article_ids || article_ids.length === 0) {
      return NextResponse.json({ error: 'article_ids が必要です' }, { status: 400 })
    }

    const { data: articles, error: fetchError } = await supabase
      .from('news_articles')
      .select('id, title, summary, source')
      .in('id', article_ids)

    if (fetchError) throw fetchError
    if (!articles || articles.length === 0) {
      return NextResponse.json({ error: '記事が見つかりませんでした' }, { status: 404 })
    }

    const userMessage = articles
      .map((a, i) => `【ニュース${i + 1}】\nタイトル：${a.title}\n要約：${a.summary}\n出典：${a.source}`)
      .join('\n\n')

    const response = await anthropic.messages.create({
      model: 'claude-haiku-4-5',
      max_tokens: 4096,
      system: [
        {
          type: 'text',
          text: systemPrompt,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userMessage }],
    })

    const textBlock = response.content.find((b) => b.type === 'text')
    if (!textBlock || textBlock.type !== 'text') {
      return NextResponse.json({ error: 'Haikuからのレスポンスが空です' }, { status: 500 })
    }

    const match = textBlock.text.match(/\{[\s\S]*\}/)
    if (!match) {
      return NextResponse.json({ error: 'JSONのパースに失敗しました' }, { status: 500 })
    }

    let parsed: { note_draft: string; x_posts: string[] }
    try {
      parsed = JSON.parse(match[0])
    } catch {
      return NextResponse.json({ error: 'JSONのパースに失敗しました' }, { status: 500 })
    }

    if (!parsed.note_draft || !Array.isArray(parsed.x_posts)) {
      return NextResponse.json({ error: 'レスポンスの形式が不正です' }, { status: 500 })
    }

    const record = {
      note_draft: parsed.note_draft,
      x_posts: parsed.x_posts,
      article_ids: article_ids,
      collected_date: new Date().toISOString().split('T')[0],
    }

    const { data: inserted, error: insertError } = await supabase
      .from('summaries')
      .insert(record)
      .select()
      .single()

    if (insertError) throw insertError

    return NextResponse.json(inserted)
  } catch (error) {
    console.error('generate-summary error:', error)
    return NextResponse.json(
      { error: 'まとめ生成中にエラーが発生しました', detail: String(error) },
      { status: 500 }
    )
  }
}

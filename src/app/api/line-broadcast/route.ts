import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const NOTE_URL = 'https://note.com/tonari_no_ai'

export async function POST() {
  try {
    const { data, error } = await supabase
      .from('summaries')
      .select('note_draft')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error) throw error
    if (!data) {
      return NextResponse.json({ error: 'summariesテーブルにデータがありません' }, { status: 404 })
    }

    const excerpt = data.note_draft.slice(0, 300)
    const message = `${excerpt}\n\n続きはnoteで👇\n${NOTE_URL}`

    const lineRes = await fetch('https://api.line.me/v2/bot/message/broadcast', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
      },
      body: JSON.stringify({
        messages: [{ type: 'text', text: message }],
      }),
    })

    if (!lineRes.ok) {
      const detail = await lineRes.text()
      return NextResponse.json(
        { error: 'LINE送信に失敗しました', detail },
        { status: 500 }
      )
    }

    return NextResponse.json({ message: 'LINE配信が完了しました' })
  } catch (error) {
    console.error('line-broadcast error:', error)
    return NextResponse.json(
      { error: 'LINE配信中にエラーが発生しました', detail: String(error) },
      { status: 500 }
    )
  }
}

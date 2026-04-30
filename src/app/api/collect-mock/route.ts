import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const MOCK_ARTICLES = [
  {
    title: 'OpenAI、GPT-5を正式発表——推論能力が前モデル比3倍に向上',
    url: 'https://example.com/openai-gpt5-announcement',
    summary: 'OpenAIはGPT-5を正式発表した。数学・コーディング・科学の推論ベンチマークで前世代比3倍の性能向上を達成。APIは段階的に提供開始予定。',
    source: 'OpenAI Blog',
    published_at: '2026-04-30',
    draft_note: `# OpenAI、GPT-5を正式発表

OpenAIが待望のGPT-5を正式発表しました。

## 主なポイント

- 推論能力が前モデル比**3倍**に向上
- 数学・コーディング・科学の各ベンチマークで最高スコアを記録
- APIは段階的に提供開始予定

## 所感

GPT-4からの進化幅は予想を超えるものでした。特にコーディング支援での活用が今後加速しそうです。開発者にとっては見逃せないアップデートといえるでしょう。

詳細はOpenAIの公式ブログをご確認ください。`,
    draft_x: '🚀 OpenAIがGPT-5を正式発表！推論能力が前世代比3倍に向上。数学・コーディング・科学のベンチマークで最高スコアを記録。API提供も順次開始予定。#OpenAI #GPT5 #AI',
  },
  {
    title: 'Anthropic、Claude 4に「拡張思考モード」追加——複雑な問題解決に特化',
    url: 'https://example.com/anthropic-claude4-extended-thinking',
    summary: 'AnthropicはClaude 4に拡張思考モードを追加。長時間の推論プロセスを可視化しながら複雑な問題を段階的に解決する機能で、専門的なタスクの精度が大幅に向上。',
    source: 'Anthropic News',
    published_at: '2026-04-29',
    draft_note: `# Claude 4に「拡張思考モード」が追加

AnthropicがClaude 4へ新機能を追加しました。

## 拡張思考モードとは

通常の応答とは異なり、AIが**推論過程を段階的に表示**しながら問題を解決するモードです。

- 複雑な数学問題や法的分析に対応
- 思考プロセスの透明性が向上
- 専門タスクでの精度が従来比で大幅改善

## 活用シーン

研究・法律・医療・財務分析など、正確性が求められる領域での活用が期待されます。

#AI #Anthropic #Claude`,
    draft_x: '🧠 AnthropicがClaude 4に「拡張思考モード」を追加。推論プロセスを可視化しながら複雑な問題を解決。専門的タスクの精度が大幅アップ！#Anthropic #Claude #AI',
  },
  {
    title: 'Google DeepMind、タンパク質構造予測AI「AlphaFold 3」を一般公開',
    url: 'https://example.com/google-deepmind-alphafold3-public',
    summary: 'Google DeepMindはAlphaFold 3を研究者向けに無償公開。DNAやRNAとの相互作用予測にも対応し、創薬・農業・環境研究への応用が広がる見込み。',
    source: 'DeepMind Blog',
    published_at: '2026-04-28',
    draft_note: `# AlphaFold 3が一般公開——創薬研究が加速へ

Google DeepMindが「AlphaFold 3」を研究者向けに無償公開しました。

## 進化したポイント

- タンパク質だけでなく**DNA・RNAとの相互作用**も予測可能に
- 創薬・農業・環境科学への応用範囲が拡大
- 研究機関は無償でアクセス可能

## 期待される影響

新薬開発のスピードアップや難病治療の糸口発見など、科学研究における革命的なツールになりえます。

#AlphaFold #DeepMind #AI #創薬`,
    draft_x: '🔬 Google DeepMindがAlphaFold 3を無償公開！タンパク質だけでなくDNA・RNAとの相互作用も予測可能に。創薬・農業・環境研究への応用が加速しそう。#DeepMind #AlphaFold #AI',
  },
  {
    title: 'EU AI法、2026年8月より全面施行——高リスクAIへの規制が本格化',
    url: 'https://example.com/eu-ai-act-enforcement-2026',
    summary: 'EU AI法が2026年8月から全面施行。採用・融資・医療診断など高リスク用途のAIには透明性確保と人間監督が義務付けられ、違反時は最大売上高の6%の制裁金。',
    source: 'EU Official',
    published_at: '2026-04-29',
    draft_note: `# EU AI法、8月から全面施行——企業の対応急務

欧州連合（EU）のAI規制法「EU AI法」がいよいよ2026年8月より全面施行されます。

## 規制の主な内容

- **高リスクAI**（採用・融資・医療）への透明性義務
- 人間による監督体制の整備が必須
- 違反時は売上高の**最大6%**の制裁金

## 日本企業への影響

EU市場でAIサービスを提供する日本企業も対象。今から準備を進める必要があります。

#EUAI法 #AI規制 #コンプライアンス`,
    draft_x: '⚖️ EU AI法が2026年8月から全面施行。採用・融資・医療などへの高リスクAI利用に透明性と人間監督が義務化。違反は売上高最大6%の制裁金。#EU #AI規制 #AIAct',
  },
  {
    title: 'Meta、オープンソースLLM「Llama 4」を公開——70Bモデルが商用利用可能に',
    url: 'https://example.com/meta-llama4-release',
    summary: 'MetaがLlama 4シリーズを公開。70Bパラメータモデルが商用利用可能なライセンスで提供され、企業の自社AIシステム構築コストの大幅削減が期待される。',
    source: 'Meta AI Blog',
    published_at: '2026-04-27',
    draft_note: `# Meta「Llama 4」公開——商用利用可能な70Bモデルで企業AIが民主化

MetaがオープンソースLLM「Llama 4」を公開しました。

## 今回のリリースの特徴

- **70Bパラメータ**モデルが商用ライセンスで利用可能
- 自社サーバーへのデプロイに対応
- クラウドAPI費用を大幅に削減できる可能性

## 活用シーン

社内文書の分析、カスタマーサポートの自動化、独自のAIアシスタント構築など、幅広いビジネス用途に活用できます。

#Meta #Llama4 #オープンソースAI #LLM`,
    draft_x: '🦙 MetaがLlama 4を公開！70Bモデルが商用利用可能に。自社サーバーにデプロイしてクラウド費用を大幅削減できる。オープンソースAIの民主化が加速🚀 #Meta #Llama4 #AI',
  },
]

export async function POST() {
  try {
    const { data: existing } = await supabase.from('news_articles').select('url')
    const existingUrls = new Set((existing || []).map((a) => a.url))

    const newArticles = MOCK_ARTICLES.filter((a) => !existingUrls.has(a.url)).map((a) => ({
      ...a,
      collected_at: new Date().toISOString(),
    }))

    if (newArticles.length === 0) {
      return NextResponse.json({ message: 'モックデータは既にすべて収集済みです', count: 0 })
    }

    const { error } = await supabase.from('news_articles').insert(newArticles)
    if (error) throw error

    return NextResponse.json({
      message: `[モック] ${newArticles.length}件の記事を追加しました`,
      count: newArticles.length,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'モックデータの保存に失敗しました', detail: String(error) },
      { status: 500 }
    )
  }
}

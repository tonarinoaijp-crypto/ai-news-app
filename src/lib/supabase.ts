import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type NewsArticle = {
  id: string
  title: string
  url: string
  summary: string | null
  source: string | null
  published_at: string | null
  collected_at: string
  draft_note: string | null
  draft_x: string | null
  is_posted: boolean
}

export type Summary = {
  id: string
  note_draft: string
  x_posts: string[]
  article_ids: string[]
  collected_date: string
  is_published: boolean
  created_at: string
}

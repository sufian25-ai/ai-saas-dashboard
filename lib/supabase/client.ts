import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  let url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  let key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  
  if (!url.startsWith('http')) {
    url = 'https://placeholder.supabase.co'
    key = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'
  }

  return createBrowserClient(url, key)
}

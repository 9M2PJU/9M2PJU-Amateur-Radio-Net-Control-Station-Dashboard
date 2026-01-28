import { createClient } from '@supabase/supabase-js'

// Next.js uses process.env for environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    // Fallback / Warning to help debugging
    console.warn(
        'Missing Supabase environment variables. Please check your .env.local file or Vercel settings.\n' +
        'Expected: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
)

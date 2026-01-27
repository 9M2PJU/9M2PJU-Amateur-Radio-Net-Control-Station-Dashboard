import { createClient } from '@supabase/supabase-js'

// Vite uses import.meta.env for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    // Fallback / Warning to help debugging
    console.warn(
        'Missing Supabase environment variables. Please check your .env.local file or Vercel settings.\n' +
        'Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    )
}

export const supabase = createClient(
    supabaseUrl || '',
    supabaseAnonKey || ''
)

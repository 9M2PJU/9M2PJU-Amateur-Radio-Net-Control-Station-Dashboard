import { createClient } from '@supabase/supabase-js'

// Vite uses import.meta.env for environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
    // Fallback / Warning to help debugging
    console.warn(
        'Missing Supabase environment variables. Please check your .env file or Vercel settings.\n' +
        'Expected: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY'
    )
}

// Basic validation to prevent crashes if env vars are missing
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'placeholder'

export const supabase = createClient(url, key)

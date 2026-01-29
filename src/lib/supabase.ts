import { createClient } from '@supabase/supabase-js'

// Check all possible naming conventions to be extremely robust
const supabaseUrl =
    import.meta.env.VITE_SUPABASE_URL ||
    import.meta.env.VITE_PUBLIC_SUPABASE_URL ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_URL

const supabaseAnonKey =
    import.meta.env.VITE_SUPABASE_ANON_KEY ||
    import.meta.env.VITE_PUBLIC_SUPABASE_ANON_KEY ||
    import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Supabase: Initializing with URL present:', !!supabaseUrl)

if (!supabaseUrl || !supabaseAnonKey) {
    console.warn(
        'Missing Supabase environment variables. Please check your Vercel settings.\n' +
        'Checked: VITE_SUPABASE_URL, VITE_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_URL'
    )
}

// Basic validation to prevent crashes if env vars are missing
const url = supabaseUrl || 'https://placeholder.supabase.co'
const key = supabaseAnonKey || 'placeholder'

export const supabase = createClient(url, key)

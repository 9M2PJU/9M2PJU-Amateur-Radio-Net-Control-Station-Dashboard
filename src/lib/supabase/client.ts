import { createBrowserClient } from '@supabase/ssr'

// Use placeholder during build, actual values at runtime
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

let client: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Check if we're in a browser and if the client hasn't been created yet
  if (typeof window !== 'undefined') {
    // Only create a new client if we haven't already
    if (!client) {
      // Check if env vars contain actual values (not placeholders)
      const hasRealUrl = process.env.NEXT_PUBLIC_SUPABASE_URL &&
        !process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder')
      const hasRealKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
        !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.includes('placeholder')

      if (hasRealUrl && hasRealKey) {
        client = createBrowserClient(supabaseUrl, supabaseAnonKey)
      }
    }
    return client!
  }

  // During SSR/build, return a client with placeholder values
  // This will fail gracefully if actually called during build
  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}

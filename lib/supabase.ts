import { createClient, type SupabaseClient } from '@supabase/supabase-js'

let cachedSupabaseClient: SupabaseClient | null = null
let cachedSupabaseAdminClient: SupabaseClient | null = null

export function getSupabase(): SupabaseClient {
  if (cachedSupabaseClient) return cachedSupabaseClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.')
  }

  cachedSupabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return cachedSupabaseClient
}

// For server-side operations with elevated privileges
export function getSupabaseAdmin(): SupabaseClient {
  if (cachedSupabaseAdminClient) return cachedSupabaseAdminClient

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error('Supabase admin client is not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.')
  }

  cachedSupabaseAdminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  })
  return cachedSupabaseAdminClient
}


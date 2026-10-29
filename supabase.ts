import { createClient, type SupabaseClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

/** True only when both public Supabase variables are present in .env.local */
export const isSupabaseConfigured = Boolean(url && anonKey)

/**
 * Only the public "anon" key is ever used in the browser. Row Level Security
 * (see README.md -> "Connect Supabase") is what protects data, not secrecy of this key.
 */
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null

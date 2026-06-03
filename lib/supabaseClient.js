import { createClient } from '@supabase/supabase-js'

/**
 * Supabase client instance initialized with server-side environment variables.
 *
 * Requires SUPABASE_URL and SUPABASE_ANON_KEY to be set in the environment.
 * This client is used for database operations including profile storage,
 * user preferences, and certificate verification records.
 */
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
    
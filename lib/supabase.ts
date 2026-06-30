import { createClient } from '@supabase/supabase-js'

// Browser (client-side) Supabase instance.
// Expects NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to be set.
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
)

export default supabase

// Convenience named export
export { supabase as supabaseClient }

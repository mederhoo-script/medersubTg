import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('CRITICAL: Missing Supabase URL or Service Role Key in lib/supabase-admin.ts')
}

// Client for server-side admin tasks (bypass RLS)
// Ensure this is only imported in server components/routes
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey)

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

/**
 * Cliente Supabase Admin (bypass RLS)
 * 
 * ⚠️ ATENÇÃO: Use este cliente APENAS no backend (API Routes, Server Components).
 * NUNCA exponha a SUPABASE_SERVICE_ROLE_KEY no frontend!
 * 
 * Este cliente é necessário para:
 * - Webhook da Evolution API (inserir dados sem autenticação)
 * - Operações administrativas que precisam bypassar RLS
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});


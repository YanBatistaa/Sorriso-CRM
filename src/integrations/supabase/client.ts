import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Lê as variáveis de ambiente do arquivo .env
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_PUBLISHABLE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Verifica se as variáveis foram carregadas corretamente
if (!SUPABASE_URL || !SUPABASE_PUBLISHABLE_KEY) {
  throw new Error("As variáveis de ambiente do Supabase não foram definidas. Verifique o seu arquivo .env");
}

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
  }
});
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta.env.VITE_SUPABASE_URL || "https://mevrqkecduhdeuqxtxkt.supabase.co").trim();
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_sAFohaUvmn8TE0z077Jq-g__VhW0ODp").trim();

const isPlaceholderUrl = (url: string) => !url || url.includes("URL_DA_SUA_INSTANCIA") || url.includes("PLACEHOLDER");
const isPlaceholderKey = (key: string) => !key || key.includes("SUA_ANON_KEY") || key.includes("PLACEHOLDER");

const isConfigured = !isPlaceholderUrl(supabaseUrl) && !isPlaceholderKey(supabaseAnonKey);

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (null as any);

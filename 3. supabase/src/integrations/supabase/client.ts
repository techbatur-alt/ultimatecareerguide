import { createClient } from '@supabase/supabase-js';

const supabaseUrl =
  import.meta.env.VITE_SUPABASE_URL ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_URL ||
  '';

const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

const createMissingSupabaseClient = () =>
  new Proxy(
    {},
    {
      get(_target, prop) {
        if (prop === 'then') return undefined;
        return new Proxy(
          () => {
            throw new Error(
              'Supabase is not configured. Set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) environment variables before using Supabase features.'
            );
          },
          {
            get() {
              throw new Error(
                'Supabase is not configured. Set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) environment variables before using Supabase features.'
              );
            },
            apply() {
              throw new Error(
                'Supabase is not configured. Set the VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY (or VITE_SUPABASE_PUBLISHABLE_KEY) environment variables before using Supabase features.'
              );
            },
          }
        );
      },
    }
  );

if (!isSupabaseConfigured) {
  console.warn('Supabase is not configured for this deployment. Authentication and database features will remain disabled until Vercel environment variables are set.');
}

export const supabase = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : (createMissingSupabaseClient() as any);

import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // 1. Remove the "!" so TypeScript knows these could be undefined
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // 2. Check if they are missing
  if (!url || !anonKey) {
    // Return a dummy client instead of an empty object to avoid type errors
    // but prevent the "URL and Key are required" crash during Vercel build
    return createBrowserClient(
      'https://placeholder.supabase.co', 
      'placeholder-key'
    );
  }

  // 3. Return the real client
  return createBrowserClient(url, anonKey);
}
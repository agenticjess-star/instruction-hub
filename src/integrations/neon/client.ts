// Neon (Managed Better Auth + Data API) client.
// Migrated from Supabase: SDK swapped to @neondatabase/neon-js with the
// SupabaseAuthAdapter so auth calls and client.from(...) queries stay
// code-compatible with the previous Supabase usage.
//
// NOTE: the single-URL createClient(url) form is not on npm yet; 0.6.2-beta
// requires the explicit two-URL object form below.
import { createClient, SupabaseAuthAdapter } from '@neondatabase/neon-js';

const AUTH_URL = import.meta.env.VITE_NEON_AUTH_URL;
const DATA_API_URL = import.meta.env.VITE_NEON_DATA_API_URL;

// Import the client like this:
// import { client } from "@/integrations/neon/client";

export const client = createClient({
  auth: { url: AUTH_URL, adapter: SupabaseAuthAdapter() },
  dataApi: { url: DATA_API_URL },
});

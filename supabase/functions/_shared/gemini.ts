import { createClient } from "npm:@supabase/supabase-js@2";

export const GEMINI_MODEL = "gemini-3.6-flash";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

/** BYOK: prefer the signed-in user's own Gemini key, fall back to the workspace key. */
export async function resolveGeminiKey(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("Authorization") ?? "";
  if (authHeader.startsWith("Bearer ")) {
    try {
      const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
        global: { headers: { Authorization: authHeader } },
        auth: { persistSession: false, autoRefreshToken: false },
      });
      const { data } = await client.from("user_settings").select("gemini_api_key").maybeSingle();
      const key = (data?.gemini_api_key ?? "").trim();
      if (key) return key;
    } catch (e) {
      console.error("resolveGeminiKey lookup failed", e);
    }
  }
  return Deno.env.get("GEMINI_API_KEY") ?? null;
}

export async function callGemini(apiKey: string, body: unknown): Promise<Response> {
  return await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) },
  );
}

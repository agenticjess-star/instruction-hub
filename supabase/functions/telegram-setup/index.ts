// telegram-setup: validates a user's Telegram bot token and registers/removes the webhook.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "not authenticated" }, 401);

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData } = await userClient.auth.getUser();
  const user = userData?.user;
  if (!user) return json({ error: "not authenticated" }, 401);

  const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let body: { action?: string; bot_token?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid body" }, 400);
  }

  if (body.action === "disconnect") {
    const { data: existing } = await admin
      .from("user_settings")
      .select("telegram_bot_token")
      .eq("user_id", user.id)
      .maybeSingle();
    if (existing?.telegram_bot_token) {
      try {
        await fetch(`https://api.telegram.org/bot${existing.telegram_bot_token}/deleteWebhook`, { method: "POST" });
      } catch (e) {
        console.error("deleteWebhook failed", e);
      }
    }
    await admin
      .from("user_settings")
      .upsert(
        {
          user_id: user.id,
          telegram_bot_token: null,
          telegram_bot_username: null,
          telegram_webhook_secret: null,
          telegram_chat_id: null,
          telegram_linked_at: null,
        },
        { onConflict: "user_id" },
      );
    return json({ ok: true });
  }

  const token = (body.bot_token ?? "").trim();
  if (!/^\d{5,}:[\w-]{20,}$/.test(token)) return json({ error: "That doesn't look like a Telegram bot token." }, 400);

  // 1. Validate the token
  const meRes = await fetch(`https://api.telegram.org/bot${token}/getMe`);
  const me = await meRes.json();
  if (!me?.ok) return json({ error: me?.description ?? "Telegram rejected that token." }, 400);

  // 2. Register the webhook with a per-user secret
  const secret = crypto.randomUUID().replace(/-/g, "");
  const webhookUrl = `${SUPABASE_URL}/functions/v1/telegram-webhook`;
  const hookRes = await fetch(`https://api.telegram.org/bot${token}/setWebhook`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      url: webhookUrl,
      secret_token: secret,
      allowed_updates: ["message", "edited_message"],
      drop_pending_updates: true,
    }),
  });
  const hook = await hookRes.json();
  if (!hook?.ok) return json({ error: hook?.description ?? "Could not register the webhook." }, 400);

  const { error } = await admin.from("user_settings").upsert(
    {
      user_id: user.id,
      telegram_bot_token: token,
      telegram_bot_username: me.result?.username ?? null,
      telegram_webhook_secret: secret,
      telegram_chat_id: null,
      telegram_linked_at: null,
    },
    { onConflict: "user_id" },
  );
  if (error) return json({ error: error.message }, 500);

  return json({ ok: true, username: me.result?.username ?? "" });
});

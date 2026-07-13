// telegram-webhook: receives Telegram updates, auto-sorts threads into groups.
// - "/link CODE" binds a chat to a user account
// - a message containing a URL → Firecrawl scrape → AI classify → save thread
// - plain text → AI classify → save thread
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
const FIRECRAWL_API_KEY = Deno.env.get("FIRECRAWL_API_KEY");
const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
const TELEGRAM_GATEWAY = "https://connector-gateway.lovable.dev/telegram";

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

async function sendTelegram(chatId: number, text: string) {
  if (!TELEGRAM_API_KEY || !LOVABLE_API_KEY) return;
  try {
    await fetch(`${TELEGRAM_GATEWAY}/sendMessage`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown", disable_web_page_preview: true }),
    });
  } catch (e) { console.error("telegram send failed", e); }
}

async function firecrawlScrape(url: string): Promise<string | null> {
  if (!FIRECRAWL_API_KEY) return null;
  try {
    const r = await fetch("https://api.firecrawl.dev/v2/scrape", {
      method: "POST",
      headers: { Authorization: `Bearer ${FIRECRAWL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ url, formats: ["markdown"], onlyMainContent: true }),
    });
    if (!r.ok) { console.error("firecrawl", r.status, await r.text()); return null; }
    const d = await r.json();
    return d?.data?.markdown ?? d?.markdown ?? null;
  } catch (e) { console.error("firecrawl error", e); return null; }
}

async function classifyThread(content: string, groups: Array<{ id: string; name: string; description?: string }>) {
  if (!GEMINI_API_KEY) return { title: content.slice(0, 60), group_id: null, rating: null };
  const groupList = groups.map(g => `- ${g.id}: ${g.name}${g.description ? ` — ${g.description}` : ""}`).join("\n") || "(none)";
  const prompt = `You are sorting an AI conversation thread into the correct instruction group.

Available groups:
${groupList}

Return JSON: {"title": string (<= 70 chars), "group_id": string|null (must be one of the ids above or null if nothing fits), "rating": "positive"|"neutral"|"negative"|null (based on how well the AI performed)}

Thread content:
${content.slice(0, 8000)}`;

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ role: "user", parts: [{ text: prompt }] }],
          generationConfig: { responseMimeType: "application/json" },
        }),
      },
    );
    if (!r.ok) { console.error("gemini", r.status, await r.text()); return { title: content.slice(0, 60), group_id: null, rating: null }; }
    const d = await r.json();
    const text = d?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(text);
    return {
      title: (parsed.title || content.slice(0, 60)).toString().slice(0, 200),
      group_id: parsed.group_id && groups.some(g => g.id === parsed.group_id) ? parsed.group_id : null,
      rating: ["positive", "neutral", "negative"].includes(parsed.rating) ? parsed.rating : null,
    };
  } catch (e) { console.error("classify error", e); return { title: content.slice(0, 60), group_id: null, rating: null }; }
}

function cleanText(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s*(Copy|Share|Edit|Regenerate|Continue|Send)\s*$/gim, "")
    .trim();
}

function extractUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s]+/);
  return m ? m[0] : null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  let update: any;
  try { update = await req.json(); } catch { return new Response("bad json", { status: 400 }); }

  const message = update.message ?? update.edited_message;
  const chatId: number | undefined = message?.chat?.id;
  const text: string = (message?.text ?? "").toString().trim();
  if (!chatId) return new Response(JSON.stringify({ ok: true, ignored: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  // /link CODE  → bind chat to user
  const linkMatch = text.match(/^\/link\s+([A-Z0-9]{4,16})/i);
  if (linkMatch) {
    const code = linkMatch[1].toUpperCase();
    const { data: profile } = await supabase.from("profiles").select("user_id").eq("telegram_link_code", code).maybeSingle();
    if (!profile) { await sendTelegram(chatId, "❌ Invalid link code. Grab a fresh one from your Dashboard."); return new Response("ok"); }
    await supabase.from("profiles").update({ telegram_chat_id: chatId, telegram_link_code: null }).eq("user_id", profile.user_id);
    await sendTelegram(chatId, "✅ *Linked.* Send me a chat URL or paste a thread — I'll auto-sort it into your instruction library.");
    return new Response("ok");
  }

  if (text === "/start" || text === "/help") {
    await sendTelegram(chatId, "*Instruction OS*\n\nSend `/link CODE` to bind this chat to your account, then paste any AI thread or link and I'll auto-sort it.");
    return new Response("ok");
  }

  // Look up user
  const { data: profile } = await supabase.from("profiles").select("user_id").eq("telegram_chat_id", chatId).maybeSingle();
  if (!profile) {
    await sendTelegram(chatId, "🔒 This chat isn't linked. Send `/link CODE` (from your Instruction OS Dashboard).");
    return new Response("ok");
  }

  if (!text) return new Response("ok");

  // Extract content: URL → firecrawl, else raw text
  const url = extractUrl(text);
  let content = text;
  let hint = "text";
  if (url && text.length < url.length + 40) {
    await sendTelegram(chatId, "🔎 Scraping link…");
    const scraped = await firecrawlScrape(url);
    if (!scraped) { await sendTelegram(chatId, "⚠️ Could not extract that link. Paste the raw text instead."); return new Response("ok"); }
    content = scraped;
    hint = "link";
  }

  content = cleanText(content);

  // Classify
  const { data: groups = [] } = await supabase
    .from("instruction_groups")
    .select("id, name, description")
    .eq("user_id", profile.user_id);
  const classification = await classifyThread(content, groups ?? []);

  const { data: inserted, error } = await supabase.from("threads").insert({
    user_id: profile.user_id,
    title: classification.title,
    raw_content: text,
    cleaned_content: content,
    platform: hint === "link" ? "web" : "telegram",
    model: "",
    group_id: classification.group_id,
    rating: classification.rating,
    source: "telegram",
  }).select("id").single();

  if (error) { console.error("insert error", error); await sendTelegram(chatId, `❌ Save failed: ${error.message}`); return new Response("ok"); }

  const groupName = classification.group_id ? (groups.find(g => g.id === classification.group_id)?.name ?? "—") : "Inbox";
  await sendTelegram(chatId, `✅ *${classification.title}*\n📁 ${groupName}${classification.rating ? `\n⭐ ${classification.rating}` : ""}\n\nView: ${SUPABASE_URL.replace(".supabase.co", ".lovable.app")}/threads/${inserted.id}`);

  return new Response(JSON.stringify({ ok: true, thread_id: inserted.id }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
});

// telegram-webhook — Vercel function. Receives Telegram updates, auto-sorts
// threads into instruction groups. Ported from the Supabase edge function.
//
// Uses the Neon serverless driver (direct Postgres) because it performs
// privileged writes (link-by-code, insert on behalf of a user) that must not go
// through the RLS-enforcing Data API.
//
// Env: NEON_DATABASE_URL, GEMINI_API_KEY, FIRECRAWL_API_KEY,
//      TELEGRAM_BOT_TOKEN, APP_BASE_URL
import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.NEON_DATABASE_URL!);
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const FIRECRAWL_API_KEY = process.env.FIRECRAWL_API_KEY;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const APP_BASE_URL = process.env.APP_BASE_URL ?? "";

const CORS = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "content-type", "Access-Control-Allow-Methods": "POST, OPTIONS" };
const json = (b: any, s = 200) => new Response(JSON.stringify(b), { status: s, headers: { ...CORS, "Content-Type": "application/json" } });

async function sendTelegram(chatId: number, text: string) {
  if (!TELEGRAM_BOT_TOKEN) return;
  try {
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      { method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { responseMimeType: "application/json" } }) }
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
  return raw.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").replace(/^\s*(Copy|Share|Edit|Regenerate|Continue|Send)\s*$/gim, "").trim();
}
function extractUrl(text: string): string | null {
  const m = text.match(/https?:\/\/[^\s]+/);
  return m ? m[0] : null;
}

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return new Response("method not allowed", { status: 405 });

  let update: any;
  try { update = await req.json(); } catch { return new Response("bad json", { status: 400 }); }

  const message = update.message ?? update.edited_message;
  const chatId: number | undefined = message?.chat?.id;
  const text: string = (message?.text ?? "").toString().trim();
  if (!chatId) return json({ ok: true, ignored: true });

  // /link CODE → bind chat to a user
  const linkMatch = text.match(/^\/link\s+([A-Z0-9]{4,16})/i);
  if (linkMatch) {
    const code = linkMatch[1].toUpperCase();
    const rows = await sql`SELECT user_id FROM public.profiles WHERE telegram_link_code = ${code} LIMIT 1`;
    const profile = rows[0];
    if (!profile) { await sendTelegram(chatId, "❌ Invalid link code. Grab a fresh one from your Dashboard."); return new Response("ok"); }
    await sql`UPDATE public.profiles SET telegram_chat_id = ${chatId}, telegram_link_code = NULL WHERE user_id = ${profile.user_id}`;
    await sendTelegram(chatId, "✅ *Linked.* Send me a chat URL or paste a thread — I'll auto-sort it into your instruction library.");
    return new Response("ok");
  }

  if (text === "/start" || text === "/help") {
    await sendTelegram(chatId, "*Instruction OS*\n\nSend `/link CODE` to bind this chat to your account, then paste any AI thread or link and I'll auto-sort it.");
    return new Response("ok");
  }

  const profiles = await sql`SELECT user_id FROM public.profiles WHERE telegram_chat_id = ${chatId} LIMIT 1`;
  const profile = profiles[0];
  if (!profile) {
    await sendTelegram(chatId, "🔒 This chat isn't linked. Send `/link CODE` (from your Instruction OS Dashboard).");
    return new Response("ok");
  }
  if (!text) return new Response("ok");

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

  const groups = await sql`SELECT id, name, description FROM public.instruction_groups WHERE user_id = ${profile.user_id}`;
  const classification = await classifyThread(content, groups as any);

  const inserted = await sql`
    INSERT INTO public.threads (user_id, title, raw_content, cleaned_content, platform, model, group_id, rating, source)
    VALUES (${profile.user_id}, ${classification.title}, ${text}, ${content}, ${hint === "link" ? "web" : "telegram"}, '', ${classification.group_id}, ${classification.rating}, 'telegram')
    RETURNING id`;
  const threadId = inserted[0]?.id;

  const groupName = classification.group_id ? ((groups as any[]).find(g => g.id === classification.group_id)?.name ?? "—") : "Inbox";
  await sendTelegram(chatId, `✅ *${classification.title}*\n📁 ${groupName}${classification.rating ? `\n⭐ ${classification.rating}` : ""}\n\nView: ${APP_BASE_URL}/threads/${threadId}`);

  return json({ ok: true, thread_id: threadId });
}

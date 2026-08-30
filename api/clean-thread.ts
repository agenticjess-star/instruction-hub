// clean-thread — Vercel function. Split a raw pasted chat transcript into
// labelled user/assistant messages via Gemini. Ported from the Supabase edge fn.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const systemPrompt = `You are a transcript normalizer for AI conversation logs.

You receive raw text copied from a chat interface (ChatGPT, Claude, Gemini, Cursor, etc). It usually contains UI noise: "Copy code", "Regenerate", "Edit", avatar initials, timestamps, share buttons, pagination, model pickers.

Your job:
1. Remove UI noise. Keep the actual conversation verbatim.
2. Split the conversation into messages and label each one "user" or "assistant". Infer speakers from structure, phrasing and formatting cues. The first message is almost always the user.
3. NEVER summarize, shorten, translate, or rewrite message content. Preserve code blocks, markdown and line breaks exactly.
4. Merge fragments that clearly belong to the same turn.
5. Suggest a short descriptive title (max 8 words) for the conversation.

Return JSON: { "title": string, "messages": [{ "role": "user" | "assistant", "content": string }] }`;

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const { raw } = await req.json();
    if (typeof raw !== "string" || !raw.trim()) return json({ error: "raw text is required" }, 400);

    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not configured");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: raw.slice(0, 200000) }] }],
          generationConfig: {
            temperature: 0,
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                title: { type: "STRING" },
                messages: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: { role: { type: "STRING", enum: ["user", "assistant"] }, content: { type: "STRING" } },
                    required: ["role", "content"],
                  },
                },
              },
              required: ["title", "messages"],
            },
          },
        }),
      }
    );

    if (!response.ok) {
      const details = await response.text();
      return json({ error: "Gemini error", status: response.status, details }, response.status);
    }
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(text);
    const messages = Array.isArray(parsed.messages) ? parsed.messages : [];
    return json({ title: parsed.title ?? "", messages });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";
import { callGemini, resolveGeminiKey } from "../_shared/gemini.ts";

const systemPrompt = `You are a transcript normalizer for AI conversation logs.

You receive raw text copied from a chat interface (ChatGPT, Claude, Gemini, Cursor, etc). It usually contains UI noise: "Copy code", "Regenerate", "Edit", avatar initials, timestamps, share buttons, pagination, model pickers.

Your job:
1. Remove UI noise. Keep the actual conversation verbatim.
2. Split the conversation into messages and label each one "user" or "assistant". Infer speakers from structure, phrasing and formatting cues. The first message is almost always the user.
3. NEVER summarize, shorten, translate, or rewrite message content. Preserve code blocks, markdown and line breaks exactly.
4. Merge fragments that clearly belong to the same turn.
5. Suggest a short descriptive title (max 8 words) for the conversation.

Return JSON: { "title": string, "messages": [{ "role": "user" | "assistant", "content": string }] }`;

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { raw } = await req.json();
    if (typeof raw !== "string" || !raw.trim()) return json({ error: "raw text is required" }, 400);

    const apiKey = await resolveGeminiKey(req);
    if (!apiKey) return json({ error: "No Gemini API key. Add one in Settings." }, 400);

    const response = await callGemini(apiKey, {
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
                properties: {
                  role: { type: "STRING", enum: ["user", "assistant"] },
                  content: { type: "STRING" },
                },
                required: ["role", "content"],
              },
            },
          },
          required: ["title", "messages"],
        },
      },
    });

    if (!response.ok) {
      const details = await response.text();
      console.error("Gemini error:", response.status, details);
      return json({ error: "Gemini error", status: response.status, details }, response.status);
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(text);
    const messages = Array.isArray(parsed.messages) ? parsed.messages : [];

    return json({ title: parsed.title ?? "", messages });
  } catch (e) {
    console.error("clean-thread error:", e);
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
});

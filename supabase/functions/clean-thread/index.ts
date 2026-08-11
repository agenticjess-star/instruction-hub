import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
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

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { raw } = await req.json();
    if (typeof raw !== "string" || !raw.trim()) {
      return new Response(JSON.stringify({ error: "raw text is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
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
        }),
      },
    );

    if (!response.ok) {
      const details = await response.text();
      console.error("Gemini error:", response.status, details);
      return new Response(JSON.stringify({ error: "Gemini error", status: response.status, details }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(text);
    const messages = Array.isArray(parsed.messages) ? parsed.messages : [];

    return new Response(
      JSON.stringify({ title: parsed.title ?? "", messages }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("clean-thread error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

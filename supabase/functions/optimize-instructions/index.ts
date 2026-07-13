import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { instructionName, instructionContent, threadContents } = await req.json();
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error("GEMINI_API_KEY is not configured");

    const systemPrompt = `You are an expert AI instruction optimizer. Analyze the provided instruction set and linked conversation threads, then return actionable improvement suggestions.

For each suggestion, provide:
- A clear, specific recommendation
- The reasoning based on thread analysis
- Priority level (high, medium, low)

Return a JSON object with a "suggestions" array (max 5 items). Each item: suggestion, reasoning, priority.`;

    const userPrompt = `Instruction: "${instructionName}"

Current Instructions:
${instructionContent}

Linked Thread Analysis:
${threadContents.map((t: string, i: number) => `Thread ${i + 1}:\n${t}`).join("\n\n")}

Analyze these threads for patterns, issues, and improvement opportunities.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: systemPrompt }] },
          contents: [{ role: "user", parts: [{ text: userPrompt }] }],
          generationConfig: {
            responseMimeType: "application/json",
            responseSchema: {
              type: "OBJECT",
              properties: {
                suggestions: {
                  type: "ARRAY",
                  items: {
                    type: "OBJECT",
                    properties: {
                      suggestion: { type: "STRING" },
                      reasoning: { type: "STRING" },
                      priority: { type: "STRING", enum: ["high", "medium", "low"] },
                    },
                    required: ["suggestion", "reasoning", "priority"],
                  },
                },
              },
              required: ["suggestions"],
            },
          },
        }),
      },
    );

    if (!response.ok) {
      const t = await response.text();
      console.error("Gemini error:", response.status, t);
      return new Response(JSON.stringify({ error: "Gemini error", status: response.status, details: t }), {
        status: response.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(text);
    return new Response(JSON.stringify({ suggestions: parsed.suggestions ?? [] }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("optimize error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

// optimize-instructions — Vercel function. Analyze an instruction's linked
// threads and draft improvement suggestions via Gemini. Ported from Supabase.
const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function json(body: any, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...CORS, "Content-Type": "application/json" } });
}

export default async function handler(req: Request) {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  try {
    const { instructionName, instructionContent, threadContents } = await req.json();
    const key = process.env.GEMINI_API_KEY;
    if (!key) throw new Error("GEMINI_API_KEY is not configured");

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
${(threadContents || []).map((t: string, i: number) => `Thread ${i + 1}:\n${t}`).join("\n\n")}

Analyze these threads for patterns, issues, and improvement opportunities.`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
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
      }
    );

    if (!response.ok) {
      const t = await response.text();
      return json({ error: "Gemini error", status: response.status, details: t }, response.status);
    }
    const data = await response.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";
    const parsed = JSON.parse(text);
    return json({ suggestions: parsed.suggestions ?? [] });
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : "Unknown error" }, 500);
  }
}

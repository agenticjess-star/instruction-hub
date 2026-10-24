// improve-instruction: streaming AI chat that helps a user draft and refine a system instruction.
import { createClient } from "npm:@supabase/supabase-js@2";
import { createOpenAI } from "npm:@ai-sdk/openai";
import { streamText, convertToModelMessages, type UIMessage } from "npm:ai";
import {
  createLovableAiGatewayRunIdFetch,
  getLovableAiGatewayRunId,
  withLovableAiGatewayRunIdHeader,
} from "../_shared/run-id.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const SYSTEM_PROMPT = `You are an expert editor of AI system instructions (agent personas) inside InstructionLoop.

Behavior:
- When the user asks you to draft, rewrite, or improve the instruction, respond with ONLY the complete instruction text. No preamble, no explanation, no markdown code fences. The response is inserted directly into the user's editor.
- When the user asks a question or wants advice, answer briefly and conversationally (1-3 sentences).
- Write instructions that are specific and structured: role, responsibilities, tone, constraints, output format, and edge-case behavior.
- Never invent capabilities, tools, or facts the user did not mention. Ask a short clarifying question when the goal is ambiguous.`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "method not allowed" }, 405);

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "not authenticated" }, 401);

  const userClient = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData?.user) return json({ error: "not authenticated" }, 401);

  const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
  if (!LOVABLE_API_KEY) return json({ error: "AI is not configured for this workspace yet." }, 500);

  let body: { messages?: UIMessage[]; instructionName?: string; instructionContent?: string };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid body" }, 400);
  }
  if (!Array.isArray(body.messages) || body.messages.length === 0) {
    return json({ error: "messages required" }, 400);
  }

  const runIdFetch = createLovableAiGatewayRunIdFetch(getLovableAiGatewayRunId(req));
  const provider = createOpenAI({
    baseURL: "https://ai.gateway.lovable.dev/v1",
    apiKey: LOVABLE_API_KEY,
    headers: { "Lovable-API-Key": LOVABLE_API_KEY, "X-Lovable-AIG-SDK": "vercel-ai-sdk" },
    fetch: runIdFetch.fetch,
  });

  const name = (body.instructionName ?? "").trim();
  const draft = (body.instructionContent ?? "").trim();
  const system = `${SYSTEM_PROMPT}

Instruction name: ${name || "(unnamed)"}

Current draft:
${draft || "(empty — help the user write it from scratch)"}`;

  try {
    const modelMessages = await convertToModelMessages(body.messages);
    const result = streamText({
      model: provider.responses("openai/gpt-6-astra"),
      system,
      messages: modelMessages,
      abortSignal: req.signal,
      providerOptions: {
        openai: {
          store: false,
          forceReasoning: true,
          reasoningEffort: "low",
          reasoningSummary: "auto",
          include: ["reasoning.encrypted_content"],
        },
      },
    });
    const response = result.toUIMessageStreamResponse({
      originalMessages: body.messages,
      sendReasoning: true,
    });
    return await withLovableAiGatewayRunIdHeader(response, runIdFetch, corsHeaders);
  } catch (e) {
    console.error("improve-instruction error:", e);
    return json({ error: e instanceof Error ? e.message : "AI request failed" }, 500);
  }
});

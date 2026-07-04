import { createClient } from "@supabase/supabase-js";
import { defineTool, type ToolContext } from "@lovable.dev/mcp-js";
import { z } from "zod";

function supabaseForUser(ctx: ToolContext) {
  return createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${ctx.getToken()}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

// Minimal thread cleaner (mirrors src/lib/cleanThread logic conservatively).
function cleanThread(raw: string): string {
  return raw
    .replace(/\r\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/^\s*(Copy|Share|Edit|Regenerate|Continue|Send)\s*$/gim, "")
    .replace(/^\s*\d+\s*\/\s*\d+\s*$/gm, "")
    .trim();
}

export default defineTool({
  name: "create_thread",
  title: "Save Thread",
  description: "Save a conversation thread. The raw content is auto-cleaned. Optionally link to an instruction set.",
  inputSchema: {
    title: z.string().min(1).max(200).describe("Short descriptive title."),
    content: z.string().min(1).describe("Raw pasted thread content (will be auto-cleaned)."),
    instruction_id: z.string().uuid().optional().describe("Optional instruction (group) UUID to link this thread to."),
    platform: z.string().max(50).optional().describe("Platform name (e.g. ChatGPT, Claude, Cursor)."),
    model: z.string().max(50).optional().describe("Model name (e.g. gpt-5, claude-sonnet-4)."),
    rating: z.enum(["positive", "neutral", "negative"]).optional().describe("Optional initial rating."),
  },
  annotations: { readOnlyHint: false, idempotentHint: false, openWorldHint: false },
  handler: async ({ title, content, instruction_id, platform, model, rating }, ctx) => {
    if (!ctx.isAuthenticated()) return { content: [{ type: "text", text: "Not authenticated" }], isError: true };
    const cleaned = cleanThread(content);
    const insert = {
      user_id: ctx.getUserId(),
      title,
      raw_content: content,
      cleaned_content: cleaned,
      platform: platform ?? "",
      model: model ?? "",
      group_id: instruction_id ?? null,
      rating: rating ?? null,
    };
    const { data, error } = await supabaseForUser(ctx).from("threads").insert(insert).select().single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    return {
      content: [{ type: "text", text: `Saved thread "${data.title}" (id: ${data.id}).` }],
      structuredContent: { thread: data },
    };
  },
});
